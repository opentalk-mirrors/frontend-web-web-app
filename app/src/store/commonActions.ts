// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { InviteCode, RoomId } from '@opentalk/rest-api-rtk-query';
import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import type { GetThunkAPI } from '@reduxjs/toolkit';
import camelcaseKeys from 'camelcase-keys';
import { Room } from 'livekit-client';
import { closeSnackbar } from 'notistack';
import convertToSnakeCase from 'snakecase-keys';

import { stopTimeLimitNotification } from '../commonComponents/Notistack/fragments/variations/TimeLimitNotification/utils';
import { BackgroundBlur } from '../modules/Media/BackgroundBlur';
import { ConferenceRoom, shutdownConferenceContext } from '../modules/WebRTC';
import { ConnectionState } from '../modules/WebRTC/ConferenceRoom';
import { BreakoutRoomId, FetchRequestError, JoinSuccessInternalState } from '../types';
import { getControllerBaseUrl } from '../utils/apiUtils';
import { handleMediaPermissionError } from '../utils/mediaErrorUtils';
import { getDeviceId } from '../utils/mediaUtils';
import type { AppDispatch, RootState } from './index';
import { getLivekitRoom } from './livekitRoom';
import type { MediaDeviceKindExtended } from './slices/mediaSlice';

export type RoomCredentials = {
  roomId: RoomId;
  password?: string;
  inviteCode?: InviteCode;
  breakoutRoomId: BreakoutRoomId | null;
};

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

const stopTrackPublications = (room: Room) => {
  room.localParticipant.trackPublications.forEach((publication) => {
    publication.track?.mediaStreamTrack.stop();
    publication.track?.stop();
  });
};

export const hangUp = createAsyncThunk<void, void, { state: RootState }>('room/hangup', async () => {
  // This ensures that all notifications visible to the user prior to hanging up
  // and being redirected to the lobby room are cleared up. If you need to show
  // notification after hanging up, make sure to call it after this function.
  closeSnackbar();
  // A workaround to disable notifications about time limitation of the conference, as they
  // have they own timeout strategy
  stopTimeLimitNotification();

  const room = getLivekitRoom();

  shutdownConferenceContext();

  stopTrackPublications(room);
  return room.disconnect();
});

export const joinSuccess = createAction<JoinSuccessInternalState>('signaling/control/join_success');
export const exitingRoomContext = createAction('room/exitingRoomContext');

interface StartMediaInterface {
  kind: MediaDeviceKindExtended;
  enabled: boolean;
  deviceId?: string;
  forceDisableAudioBeforePromptIsShown?: boolean;
  isPopoutStream?: boolean;
}

interface FetchPermissionError extends FetchRequestError {
  kind: MediaDeviceKindExtended;
}

export async function handleLocalMediaTrack({
  thunkApi,
  kind,
  enabled,
  deviceId: deviceIdOption,
  inMeetingView,
}: {
  thunkApi: GetThunkAPI<{
    state: RootState;
    dispatch: AppDispatch;
    rejectValue: { status: number; statusText: string; kind: MediaDeviceKindExtended };
  }>;
  kind: 'audioinput' | 'videoinput';
  enabled: boolean;
  deviceId?: string;
  inMeetingView: boolean;
}): Promise<StartMediaInterface | ReturnType<typeof thunkApi.rejectWithValue>> {
  const state = thunkApi.getState();
  const storedDeviceId = (() => {
    switch (kind) {
      case 'audioinput':
        return state.media.audioDeviceId;
      case 'videoinput':
        return state.media.videoDeviceId;
      default:
        return undefined;
    }
  })();

  const deviceId = deviceIdOption || storedDeviceId;
  const result: StartMediaInterface = { kind, enabled, deviceId };

  if (inMeetingView) {
    const localParticipant = getLivekitRoom().localParticipant;
    try {
      const track = await (async () => {
        switch (kind) {
          case 'audioinput':
            return await localParticipant.setMicrophoneEnabled(enabled, { deviceId });
          case 'videoinput':
          default:
            return await localParticipant.setCameraEnabled(enabled, {
              deviceId,
              processor: new BackgroundBlur(thunkApi.getState().media.videoBackgroundEffects),
            });
        }
      })();

      const mediaStreamTrack =
        kind === 'audioinput' ? track?.audioTrack?.mediaStreamTrack : track?.videoTrack?.mediaStreamTrack;

      if (mediaStreamTrack) {
        result.deviceId = await track?.videoTrack?.getDeviceId();
      }
    } catch (error) {
      const mediaError = handleMediaPermissionError({ error, deviceId, kind });
      return thunkApi.rejectWithValue({
        status: 409,
        statusText: mediaError.name,
        kind,
      });
    }

    return result;
  }

  // Lobby
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      [kind === 'audioinput' ? 'audio' : 'video']: { deviceId },
    });
    const mediaTrack = kind === 'audioinput' ? stream.getAudioTracks()[0] : stream.getVideoTracks()[0];

    if (mediaTrack) {
      result.deviceId = getDeviceId(mediaTrack);
      mediaTrack.stop();
    }
    return result;
  } catch (error) {
    const mediaError = handleMediaPermissionError({ error, deviceId, kind });
    return thunkApi.rejectWithValue({
      status: 409,
      statusText: mediaError.name,
      kind,
    });
  }
}

export const startMedia = createAsyncThunk<
  StartMediaInterface,
  StartMediaInterface,
  { state: RootState; rejectValue: FetchPermissionError }
>(
  'media/startMedia',
  async ({ kind, enabled, deviceId, forceDisableAudioBeforePromptIsShown, isPopoutStream }, thunkApi) => {
    const state = thunkApi.getState();
    const inMeetingView =
      isPopoutStream ||
      state.room.connectionState === ConnectionState.Online ||
      state.room.connectionState === ConnectionState.Leaving;

    try {
      switch (kind) {
        case 'audioinput':
        case 'videoinput':
          return await handleLocalMediaTrack({ thunkApi, kind, enabled, deviceId, inMeetingView });

        case 'screenshare':
          if (inMeetingView) {
            await getLivekitRoom().localParticipant.setScreenShareEnabled(enabled);
          }
          return {
            kind,
            enabled,
          };
        default:
          return {
            kind,
            enabled,
            forceDisableAudioBeforePromptIsShown,
          };
      }
    } catch (error) {
      const mediaError = handleMediaPermissionError({ error, deviceId, kind });
      return thunkApi.rejectWithValue({ status: 409, statusText: mediaError.name, kind });
    }
  }
);
