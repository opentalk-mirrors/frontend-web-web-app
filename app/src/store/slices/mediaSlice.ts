// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { isAnyOf } from '@reduxjs/toolkit';

import { RequestMute } from '../../api/types/incoming/media';
import { ParticipantId, VideoSetting } from '../../types';
import { TimerStyle } from '../../types';
import { MediaError } from '../../utils/mediaErrorUtils';
import { hangUp, startMedia } from '../commonActions';
import type { RootState } from '../index';
import type { StartAppListening } from '../listenerMiddleware';
import { getLivekitRoom } from '../livekitRoom';
import { enteredWaitingRoom } from './roomSlice';
import { timerStarted } from './timerSlice';

export interface BackgroundConfig {
  style: 'blur' | 'color' | 'image' | 'off';
  color?: string;
  imageUrl?: string;
}

export enum NotificationKind {
  ForceMute = 'forceMute',
  RequestMute = 'requestMute',
}

interface MuteNotification {
  kind: NotificationKind;
  origin: ParticipantId;
}

export interface BackgroundEffect extends BackgroundConfig {
  loading?: boolean;
}

export type MediaState = {
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
};

export type MediaDeviceKindExtended = MediaDeviceKind | 'screenshare';

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
        state.permissionDenied.audio = false;
        state.audioDeviceId = payload.deviceId;
      }
      if (payload.kind === 'videoinput') {
        state.videoEnabled = payload.enabled;
        state.permissionDenied.video = false;
        // livekit setCameraEnabled when disabling returns empty string as device id
        // which overrides the last choosen device
        if (payload.deviceId && payload.deviceId?.length > 0) {
          state.videoDeviceId = payload.deviceId;
        }
      }
      state.mediaChangeInProgress = null;
    });
    builder.addCase(hangUp.fulfilled, (state) => {
      state.videoEnabled = false;
      state.audioEnabled = false;
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

export const reHydrateSlice = () => {
  const storageItem = localStorage.getItem('mediaChoices');
  if (storageItem !== null) {
    return JSON.parse(storageItem);
  }

  return undefined;
};

export default mediaSlice.reducer;

/************************************************/
/*                                              */
/*                  Listeners                   */
/*                                              */
/************************************************/

const startDisableMediaOnCoffeeBreakListener = (startAppListening: StartAppListening) =>
  startAppListening({
    actionCreator: timerStarted,
    effect: (action, listenerApi) => {
      const room = getLivekitRoom();

      //Avoid sending reconfigure if both video and audio tracks are not active
      const isAnyMediaTrackEnabled = room.localParticipant.isMicrophoneEnabled || room.localParticipant.isCameraEnabled;
      const isShareScreenEnabled = room.localParticipant.isScreenShareEnabled;

      if (action.payload.style === TimerStyle.CoffeeBreak) {
        if (isAnyMediaTrackEnabled) {
          listenerApi.dispatch(startMedia({ kind: 'audioinput', enabled: false }));
          listenerApi.dispatch(startMedia({ kind: 'videoinput', enabled: false }));
        }
        if (isShareScreenEnabled) {
          listenerApi.dispatch(startMedia({ kind: 'screenshare', enabled: false }));
        }
      }
    },
  });

const startDisableMediaOnWaitingRoomListener = (startAppListening: StartAppListening) =>
  startAppListening({
    actionCreator: enteredWaitingRoom,
    effect: (_, listenerApi) => {
      listenerApi.dispatch(startMedia({ kind: 'audioinput', enabled: false }));
      listenerApi.dispatch(startMedia({ kind: 'videoinput', enabled: false }));
      listenerApi.dispatch(startMedia({ kind: 'screenshare', enabled: false }));
    },
  });

const startMediaChoiceListener = (startAppListening: StartAppListening) =>
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

export const startMediaListeners = (startAppListening: StartAppListening) => {
  startDisableMediaOnCoffeeBreakListener(startAppListening);
  startDisableMediaOnWaitingRoomListener(startAppListening);
  startMediaChoiceListener(startAppListening);
};
