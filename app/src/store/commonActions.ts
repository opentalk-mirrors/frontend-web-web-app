// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { XORCipher } from '@opentalk/redux-oidc';
import { EventInfo, InviteCode, RoomId } from '@opentalk/rest-api-rtk-query';
import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import camelcaseKeys from 'camelcase-keys';
import {
  ConnectionState,
  createLocalAudioTrack,
  createLocalVideoTrack,
  E2EEOptions,
  ExternalE2EEKeyProvider,
  isE2EESupported,
  LocalAudioTrack,
  LocalVideoTrack,
  Room,
  Track,
  VideoPresets,
} from 'livekit-client';
import { closeSnackbar } from 'notistack';
import convertToSnakeCase from 'snakecase-keys';

import { stopTimeLimitNotification } from '../commonComponents/Notistack/fragments/variations/TimeLimitNotification/utils';
import { BackgroundBlur, BackgroundConfig } from '../modules/Media/BackgroundBlur';
import { ConferenceRoom, shutdownConferenceContext } from '../modules/WebRTC';
import { BreakoutRoomId, FetchRequestError, JoinSuccessInternalState } from '../types';
import { getControllerBaseUrl } from '../utils/apiUtils';
import { createE2Eworker } from '../utils/createE2EworkerUtils';
import { handleMediaPermissionError } from '../utils/mediaErrorUtils';
import type { RootState } from './index';
import { ScreenShareResolutionValues } from './slices/mediaSlice';

export type RoomCredentials = {
  roomId: RoomId;
  password?: string;
  inviteCode?: InviteCode;
  breakoutRoomId: BreakoutRoomId | null;
};

export interface ChangeMediaInterface {
  enabled: boolean;
  kind: MediaDeviceKind;
  preventActiveMediaAfterPermissionPrompt?: boolean;
}

interface FetchPermissionError extends FetchRequestError {
  kind: MediaDeviceKind;
}
export interface ChangeLocalMediaResponse {
  track?: LocalAudioTrack | LocalVideoTrack;
  deviceId: string | undefined;
}

export const login = createAsyncThunk<{ permission: Array<string> }, string, { state: RootState; rejectValue: Error }>(
  'user/login',
  async (idToken: string, thunkApi) => {
    const { getState } = thunkApi;
    const baseUrl = getControllerBaseUrl(getState().config);
    const response = await fetch(new URL('v1/auth/login', baseUrl).toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(convertToSnakeCase({ idToken })),
    });

    return camelcaseKeys(await response.json(), { deep: true });
  }
);

export const startRoom = createAsyncThunk<
  { conferenceContext: ConferenceRoom; resumption: string },
  RoomCredentials & { displayName: string },
  { state: RootState }
>('room/start', async (credentials, { getState }) => {
  const config = getState().config;
  const { resumptionToken, roomId } = getState().room;
  if (credentials.displayName.length === 0) {
    throw new Error('displayName must ne non empty');
  }
  return ConferenceRoom.create(credentials, config, credentials.roomId === roomId ? resumptionToken : undefined);
});

export const hangUp = createAsyncThunk<void, void, { state: RootState }>('room/hangup', async () => {
  // This ensures that all notifications visible to the user prior to hanging up
  // and being redirected to the lobby room are cleared up. If you need to show
  // notification after hanging up, make sure to call it after this function.
  closeSnackbar();
  // A workaround to disable notifications about time limitation of the conference, as they
  // have they own timeout strategy
  stopTimeLimitNotification();
  shutdownConferenceContext();
});

export const joinSuccess = createAction<JoinSuccessInternalState>('signaling/control/join_success');

export const changeLocalMedia = createAsyncThunk<
  ChangeLocalMediaResponse,
  ChangeMediaInterface,
  { state: RootState; rejectValue: FetchRequestError }
>('media/changeLocalMedia', async ({ enabled, kind }, thunkApi) => {
  let track: LocalAudioTrack | LocalVideoTrack | undefined;
  const state = thunkApi.getState();
  let trackDeviceId =
    kind === 'audioinput' ? state.livekit.mediaSettings?.audioDeviceId : state.livekit.mediaSettings?.videoDeviceId;

  try {
    if (enabled) {
      if (kind === 'audioinput') {
        track = await createLocalAudioTrack({ deviceId: trackDeviceId });
        trackDeviceId = await track.getDeviceId();
      }

      if (kind === 'videoinput') {
        const videoBackgroundSettings = state.livekit?.videoBackgroundEffects;
        track = await createLocalVideoTrack({
          deviceId: trackDeviceId,
          processor: new BackgroundBlur(videoBackgroundSettings),
        });
        trackDeviceId = await track.getDeviceId();
      }
    }
    return {
      deviceId: trackDeviceId,
      track,
    };
  } catch (error) {
    const mediaError = handleMediaPermissionError({ error, kind });
    return thunkApi.rejectWithValue({ status: 409, statusText: mediaError.name });
  }
});

export const switchLocalDevice = createAsyncThunk<
  { track?: LocalAudioTrack | LocalVideoTrack },
  { kind: MediaDeviceKind; deviceId: string; exact?: boolean },
  { state: RootState; rejectValue: FetchRequestError }
>('media/switchLocalDevice', async ({ deviceId, kind }, thunkApi) => {
  let track: LocalVideoTrack | LocalAudioTrack | undefined;

  try {
    if (kind === 'audioinput') {
      const isLocalMicrophoneEnabled = thunkApi.getState().livekit.lobby.audioTrackPublication;
      if (isLocalMicrophoneEnabled) {
        track = await createLocalAudioTrack({ deviceId });
      }
    }
    if (kind === 'videoinput') {
      const isLocalCameraEnabled = thunkApi.getState().livekit.lobby.videoTrackPublication;
      if (isLocalCameraEnabled) {
        const videoBackgroundSettings = thunkApi.getState().livekit?.videoBackgroundEffects;
        track = await createLocalVideoTrack({ deviceId, processor: new BackgroundBlur(videoBackgroundSettings) });
      }
    }

    return {
      track,
    };
  } catch (error) {
    const mediaError = handleMediaPermissionError({ error, deviceId, kind: 'videoinput' });
    return thunkApi.rejectWithValue({ status: 409, statusText: mediaError.name });
  }
});

export const setBackgroundEffects = createAsyncThunk<
  void,
  BackgroundConfig,
  { state: RootState; rejectValue: FetchRequestError }
>('media/setBackgroundEffects', async (payload, thunkApi) => {
  const livekitSlice = thunkApi.getState().livekit;
  const room = livekitSlice.room;

  const videoProcessor = new BackgroundBlur(payload);
  try {
    if (room?.state === ConnectionState.Connected) {
      const track = room?.localParticipant.getTrackPublication(Track.Source.Camera);
      // Workaround untill livekit update (solved with https://github.com/livekit/client-sdk-js/pull/1149)
      if (track?.track?.isMuted) {
        return;
      }
      await track?.videoTrack?.setProcessor(videoProcessor);
    } else {
      await livekitSlice.lobby.videoTrackPublication?.setProcessor(videoProcessor);
    }
  } catch (error) {
    if (error instanceof Error) {
      return thunkApi.rejectWithValue({ status: 409, statusText: error.name });
    }
    throw new Error(`Error updating background: ${error}`);
  }
});

export const changeMedia = createAsyncThunk<
  void,
  ChangeMediaInterface,
  { state: RootState; rejectValue: FetchPermissionError }
>('livekit/changeMedia', async ({ enabled, kind, preventActiveMediaAfterPermissionPrompt }, thunkApi) => {
  const state = thunkApi.getState();
  const room = state.livekit.room;
  const deviceId =
    kind === 'audioinput' ? state.livekit.mediaSettings?.audioDeviceId : state.livekit.mediaSettings?.videoDeviceId;

  try {
    if (kind === 'audioinput') {
      const permission = await navigator.permissions.query({ name: 'microphone' });
      const isPermissionPromptShown = permission.state === 'prompt';
      await room?.localParticipant.setMicrophoneEnabled(enabled, { deviceId: deviceId });
      if (isPermissionPromptShown) {
        window.dispatchEvent(new CustomEvent('hotkeys:clearPushedKeys'));

        if (preventActiveMediaAfterPermissionPrompt) {
          await room?.localParticipant.setMicrophoneEnabled(false, { deviceId: deviceId });
        }
      }
    }
    if (kind === 'videoinput') {
      const videoBackgroundSettings = state.livekit?.videoBackgroundEffects;

      await room?.localParticipant.setCameraEnabled(enabled, {
        deviceId: deviceId,
        processor: enabled ? new BackgroundBlur(videoBackgroundSettings) : undefined,
      });
    }
  } catch (error) {
    const mediaError = handleMediaPermissionError({ error, deviceId, kind });
    return thunkApi.rejectWithValue({ status: 409, statusText: mediaError.name, kind });
  }
});

export const setScreenShareEnabled = createAsyncThunk<
  void,
  { enabled: boolean },
  { state: RootState; rejectValue: FetchPermissionError }
>('livekit/startScreenShare', async ({ enabled }, thunkApi) => {
  const state = thunkApi.getState();
  const room = state.livekit.room;
  const screenShareConfig = state.media.screenShareConfig;

  try {
    await room?.localParticipant.setScreenShareEnabled(enabled, {
      audio: true,
      systemAudio: 'include',
      resolution: screenShareConfig?.resolution && ScreenShareResolutionValues[screenShareConfig?.resolution],
      surfaceSwitching: 'include',
    });
  } catch (error) {
    const mediaError = handleMediaPermissionError({ error, deviceId: '', kind: 'screenshare' });
    return thunkApi.rejectWithValue({ status: 409, statusText: mediaError.name, kind: 'videoinput' });
  }
});

export const switchScreenShare = createAsyncThunk<void, void, { state: RootState; rejectValue: FetchPermissionError }>(
  'livekit/switchScreenShare',
  async (_, thunkApi) => {
    const participant = thunkApi.getState().livekit.room?.localParticipant;

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      const newVideoTrack = stream.getVideoTracks()[0];
      const currentScreenShareTrack = participant?.getTrackPublication(Track.Source.ScreenShare)?.track;
      if (currentScreenShareTrack) {
        await participant?.unpublishTrack(currentScreenShareTrack);
      }
      await participant?.publishTrack(newVideoTrack, {
        name: 'screen-share',
        source: Track.Source.ScreenShare,
      });
    } catch (error) {
      const mediaError = handleMediaPermissionError({ error, deviceId: '', kind: 'screenshare' });
      return thunkApi.rejectWithValue({ status: 409, statusText: mediaError.name, kind: 'videoinput' });
    }
  }
);

export const switchActiveDevice = createAsyncThunk<
  void,
  { kind: MediaDeviceKind; deviceId: string; exact?: boolean },
  { state: RootState; rejectValue: FetchPermissionError }
>('livekit/switchActiveDevice', async ({ kind, deviceId, exact }, thunkApi) => {
  const room = thunkApi.getState().livekit.room;
  try {
    await room?.switchActiveDevice(kind, deviceId, exact);
    if (kind === 'videoinput') {
      const videoBackgroundSettings = thunkApi.getState().livekit?.videoBackgroundEffects;
      room?.localParticipant
        .getTrackPublication(Track.Source.Camera)
        ?.videoTrack?.setProcessor(new BackgroundBlur(videoBackgroundSettings));
    }
  } catch (error) {
    const mediaError = handleMediaPermissionError({ error, deviceId, kind });
    return thunkApi.rejectWithValue({ status: 409, statusText: mediaError.name, kind });
  }
});

export const disconnectRoom = createAsyncThunk<
  void,
  { isWhisperRoom: boolean },
  { state: RootState; rejectValue: FetchRequestError }
>('livekit/disconnectRoom', async ({ isWhisperRoom }, thunkApi) => {
  const room = isWhisperRoom ? thunkApi.getState().livekit.whisperRoom : thunkApi.getState().livekit.room;
  try {
    await room?.disconnect();
  } catch (error) {
    if (error instanceof Error) {
      return thunkApi.rejectWithValue({ status: 409, statusText: error?.message });
    }
    return thunkApi.rejectWithValue({ status: 409, statusText: `Error disconnecting to room:${error}` });
  }
});

export const connectRoom = createAsyncThunk<
  { room: Room },
  { eventInfo?: EventInfo; isWhisperRoom: boolean; accessToken?: string },
  { state: RootState; rejectValue: FetchRequestError }
>('livekit/connectRoom', async ({ eventInfo, accessToken }, thunkApi) => {
  try {
    const token = accessToken || thunkApi.getState().livekit.accessToken;

    if (!token) {
      throw Error('No access token available for LiveKit connection');
    }
    const e2eeSalt = thunkApi.getState().config.livekit?.e2eeSalt;
    const room = await createRoom(e2eeSalt, eventInfo || thunkApi.getState().room.eventInfo);

    return { room };
  } catch (error) {
    if (error instanceof Error) {
      return thunkApi.rejectWithValue({ status: 409, statusText: error?.message });
    }
    return thunkApi.rejectWithValue({ status: 409, statusText: `Error connecting to room:${error}` });
  }
});

export const createRoom = async (e2eeSalt: string | undefined, eventInfo?: EventInfo) => {
  const e2eePassphrase = XORCipher.handle(`${eventInfo?.id}${eventInfo?.roomId}${e2eeSalt || ''}`);

  const mainWorker = createE2Eworker(e2eePassphrase, eventInfo?.e2eEncryption);
  const e2eeEnabled = (eventInfo?.e2eEncryption || false) && !!(e2eePassphrase && mainWorker) && isE2EESupported();
  const keyProvider = new ExternalE2EEKeyProvider();

  const roomOptions = {
    publishDefaults: {
      /*
       * Up to two additional simulcast layers to publish in addition to the original
       * Track.
       * When left blank, it defaults to h180, h360.
       * If a SVC codec is used (VP9 or AV1), this field has no effect.
       * videoSimulcastLayers: [VideoPresets.h1080, VideoPresets.h720],
       * */
      red: !e2eeEnabled,
      simulcast: true,
    },
    dynacast: true,
    disconnectOnPageLeave: false,
    adaptiveStream: true,
    videoCaptureDefaults: {
      resolution: VideoPresets.h720.resolution,
    },
    encryption: e2eeEnabled
      ? ({
          keyProvider,
          worker: mainWorker,
        } as E2EEOptions)
      : undefined,
  };

  const room = new Room(roomOptions);

  if (e2eeEnabled && !room.isE2EEEnabled) {
    keyProvider.setKey(e2eePassphrase);
    try {
      await room.setE2EEEnabled(true);
    } catch (error) {
      console.debug(`E2ee encryption error: ${error}`);
    }
  }

  return room;
};
