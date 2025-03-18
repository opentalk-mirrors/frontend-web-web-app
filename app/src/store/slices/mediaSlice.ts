// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  PayloadAction,
  TypedStartListening,
  createAsyncThunk,
  createListenerMiddleware,
  createSlice,
  isAnyOf,
} from '@reduxjs/toolkit';

import type { AppDispatch, RootState } from '../';
import { RequestMute } from '../../api/types/incoming/media';
import { ConnectionState } from '../../modules/WebRTC/ConferenceRoom';
import { FetchRequestError, ParticipantId, VideoSetting } from '../../types';
import { MediaError, handleMediaPermissionError } from '../../utils/mediaErrorUtils';
import { getDeviceId } from '../../utils/mediaUtils';
import { getLivekitRoom } from '../livekitRoom';

export interface BackgroundConfig {
  style: 'blur' | 'color' | 'image' | 'off';
  color?: string;
  imageUrl?: string;
}

export enum NotificationKind {
  ForceMute = 'forceMute',
  RequestMute = 'requestMute',
}

export interface AudioAndVideoUpdate {
  audio: boolean;
  video: boolean;
}

interface MuteNotification {
  kind: NotificationKind;
  origin: ParticipantId;
}

export interface BackgroundEffect extends BackgroundConfig {
  loading?: boolean;
}

interface MediaState {
  qualityCap: VideoSetting;
  upstreamLimit: VideoSetting;
  requestMuteNotification?: MuteNotification;
  isUserSpeaking: boolean;
  videoEnabled: boolean;
  videoDeviceId?: string;
  audioEnabled: boolean;
  audioDeviceId?: string;
  videoBackgroundEffects: BackgroundEffect;
  mediaChangeInProgress: MediaDeviceKindExtended | null;
  permissionDenied: {
    audio: boolean;
    video: boolean;
    screenshare: boolean;
  };
}

export type MediaDeviceKindExtended = MediaDeviceKind | 'screenshare';
export interface StartMediaInterface {
  kind: MediaDeviceKindExtended;
  enabled: boolean;
  deviceId?: string;
}

export interface FetchPermissionError extends FetchRequestError {
  kind: MediaDeviceKindExtended;
}

export const startMedia = createAsyncThunk<
  StartMediaInterface,
  StartMediaInterface,
  { state: RootState; rejectValue: FetchPermissionError }
>('media/startMedia', async ({ kind, enabled, deviceId }, thunkApi) => {
  const roomState = thunkApi.getState().room;
  const inMeetingView =
    roomState.connectionState === ConnectionState.Online || roomState.connectionState === ConnectionState.Leaving;
  try {
    switch (kind) {
      case 'audioinput': {
        const payload: StartMediaInterface = {
          kind,
          enabled,
          deviceId,
        };
        if (inMeetingView) {
          const track = await getLivekitRoom().localParticipant.setMicrophoneEnabled(enabled, { deviceId });
          const mediaStreamTrack = track?.audioTrack?.mediaStreamTrack;

          if (mediaStreamTrack) {
            payload.deviceId = getDeviceId(mediaStreamTrack);
          }
        }

        return payload;
      }
      case 'videoinput': {
        const payload: StartMediaInterface = {
          kind,
          enabled,
          deviceId,
        };
        if (inMeetingView) {
          const track = await getLivekitRoom().localParticipant.setCameraEnabled(enabled, { deviceId });
          const mediaStreamTrack = track?.videoTrack?.mediaStreamTrack;

          if (mediaStreamTrack) {
            payload.deviceId = getDeviceId(mediaStreamTrack);
          }
        }
        return payload;
      }
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
        };
    }
  } catch (error) {
    const mediaError = handleMediaPermissionError({ error, deviceId, kind });
    return thunkApi.rejectWithValue({ status: 409, statusText: mediaError.name, kind });
  }
});

export const initialState: MediaState = {
  qualityCap: VideoSetting.High,
  upstreamLimit: VideoSetting.High,
  isUserSpeaking: false,
  videoEnabled: false,
  audioEnabled: false,
  videoBackgroundEffects: { style: 'off', loading: false },
  mediaChangeInProgress: null,
  permissionDenied: {
    audio: false,
    video: false,
    screenshare: false,
  },
};

export const mediaSlice = createSlice({
  name: 'media',
  initialState,
  reducers: {
    setBackgroundEffects: (state, { payload }: PayloadAction<BackgroundConfig>) => {
      state.videoBackgroundEffects = payload;
    },
    setBackgroundEffectsLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.videoBackgroundEffects.loading = payload;
    },
    setUpstreamLimit: (state, { payload }: PayloadAction<VideoSetting>) => {
      state.upstreamLimit = payload;
    },
    requestMute: (state, { payload }: PayloadAction<RequestMute>) => {
      if (payload.force) {
        state.requestMuteNotification = { kind: NotificationKind.ForceMute, origin: payload.issuer };
      } else {
        state.requestMuteNotification = { kind: NotificationKind.RequestMute, origin: payload.issuer };
      }
    },
    notificationShown: (state) => {
      state.requestMuteNotification = undefined;
    },
    setVideoEnabled: (state, { payload }: PayloadAction<boolean>) => {
      state.videoEnabled = payload;
    },
    setAudioEnabled: (state, { payload }: PayloadAction<boolean>) => {
      state.audioEnabled = payload;
    },
    setVideoDeviceId: (state, { payload }: PayloadAction<string>) => {
      state.videoDeviceId = payload;
    },
    setAudioDeviceId: (state, { payload }: PayloadAction<string>) => {
      state.audioDeviceId = payload;
    },
    setAudioPermissionDenied: (state, { payload }: PayloadAction<boolean>) => {
      state.permissionDenied.audio = payload;
    },
    setVideoPermissionDenied: (state, { payload }: PayloadAction<boolean>) => {
      state.permissionDenied.video = payload;
    },
    setMediaChangeInProgress: (state, { payload }: PayloadAction<MediaDeviceKindExtended | null>) => {
      state.mediaChangeInProgress = payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(startMedia.pending, (state, { meta: { arg } }) => {
      state.mediaChangeInProgress = arg.kind;
    });
    builder.addCase(startMedia.rejected, (state, { payload }) => {
      if (payload?.statusText === MediaError.NotAllowedError) {
        if (payload.kind === 'audioinput') {
          state.permissionDenied.audio = true;
        }
        if (payload.kind === 'videoinput') {
          state.permissionDenied.video = true;
        }
      }
      state.mediaChangeInProgress = null;
    });
    builder.addCase(startMedia.fulfilled, (state, { payload }) => {
      if (payload.kind === 'audioinput') {
        state.audioEnabled = payload.enabled;
        state.audioDeviceId = payload.deviceId;
      }
      if (payload.kind === 'videoinput') {
        state.videoEnabled = payload.enabled;
        // livekit setCameraEnabled when disabling returns empty string as device id
        // which overrides the last choosen device
        if (payload.deviceId && payload.deviceId?.length > 0) {
          state.videoDeviceId = payload.deviceId;
        }
      }
      state.mediaChangeInProgress = null;
    });
  },
});

export const {
  setBackgroundEffects,
  setBackgroundEffectsLoading,
  notificationShown,
  setVideoEnabled,
  setAudioEnabled,
  setVideoDeviceId,
  setAudioDeviceId,
  setAudioPermissionDenied,
  setVideoPermissionDenied,
  setMediaChangeInProgress,
} = mediaSlice.actions;

export const selectIsUserSpeaking = (state: RootState) => state.media.isUserSpeaking;
export const selectUpstreamLimit = (state: RootState) => state.media.upstreamLimit;
export const selectNotification = (state: RootState) => state.media.requestMuteNotification;
export const selectAudioDeviceId = (state: RootState) => state.media.audioDeviceId;
export const selectVideoDeviceId = (state: RootState) => state.media.videoDeviceId;
export const selectAudioEnabled = (state: RootState) => state.media.audioEnabled;
export const selectVideoEnabled = (state: RootState) => state.media.videoEnabled;
export const selectVideoBackgroundEffects = (state: RootState) => state.media.videoBackgroundEffects;
export const selectAudioPermissionDenied = (state: RootState) => state.media.permissionDenied.audio;
export const selectVideoPermissionDenied = (state: RootState) => state.media.permissionDenied.video;
export const selectScreensharePermissionDenied = (state: RootState) => state.media.permissionDenied.screenshare;
export const selectAudioChangeInProgress = (state: RootState) => state.media.mediaChangeInProgress === 'audioinput';
export const selectVideoChangeInProgress = (state: RootState) => state.media.mediaChangeInProgress === 'videoinput';
export const selectScreenshareChangeInProgress = (state: RootState) =>
  state.media.mediaChangeInProgress === 'screenshare';
export const selectMediaChangeInProgress = (state: RootState) => state.media.mediaChangeInProgress !== null;

export const actions = mediaSlice.actions;

export const mediaMiddleware = createListenerMiddleware();
type AppStartListening = TypedStartListening<RootState, AppDispatch>;

const startAppListening = mediaMiddleware.startListening as AppStartListening;

startAppListening({
  matcher: isAnyOf(setBackgroundEffects, setAudioDeviceId, setVideoDeviceId),
  effect: (_, listenerApi) => {
    const { videoBackgroundEffects, videoDeviceId, audioDeviceId } = listenerApi.getState().media;

    const updatedChoices = {
      videoBackgroundEffects,
      videoDeviceId,
      audioDeviceId,
    };

    localStorage.setItem('mediaChoices', JSON.stringify(updatedChoices));
  },
});

export const reHydrateSlice = () => {
  const storageItem = localStorage.getItem('mediaChoices');
  if (storageItem !== null) {
    return JSON.parse(storageItem);
  }

  return undefined;
};

export default mediaSlice.reducer;
