// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { isAnyOf } from '@reduxjs/toolkit';
import { Track } from 'livekit-client';

import { RequestMute } from '../../api/types/incoming/media';
import { BackgroundBlur } from '../../modules/Media/BackgroundBlur';
import { ParticipantId, VideoSetting } from '../../types';
import { TimerStyle } from '../../types';
import { MediaError } from '../../utils/mediaErrorUtils';
import { hangUp, startMedia } from '../commonActions';
import type { RootState } from '../index';
import type { StartAppListening } from '../listenerMiddleware';
import { getLivekitRoom } from '../livekitRoom';
import { timerStarted } from './timerSlice';

export interface ScreenShareConfig {
  resolution?: ScreenShareResolution;
  contentHint?: ContentHint;
}

export enum ContentHint {
  Text = 'text',
  Motion = 'motion',
}

export enum ScreenShareResolution {
  R720p = '720p',
  R1080p = '1080p',
  R1440p = '1440p',
  R2160p = '2160p',
}

export const ScreenShareResolutionValues = {
  [ScreenShareResolution.R720p]: { width: 1280, height: 720 },
  [ScreenShareResolution.R1080p]: { width: 1920, height: 1080 },
  [ScreenShareResolution.R1440p]: { width: 2560, height: 1440 },
  [ScreenShareResolution.R2160p]: { width: 3840, height: 2160 },
};

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
  screenShareConfig?: ScreenShareConfig;
  mediaChangeInProgress: MediaDeviceKindExtended | null;
  permission: {
    audioDenied: boolean;
    videoDenied: boolean;
    screenshareDenied: boolean;
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
  screenShareConfig: {
    resolution: ScreenShareResolution.R1080p,
    contentHint: ContentHint.Text,
  },
  mediaChangeInProgress: null,
  permission: {
    audioDenied: false,
    videoDenied: false,
    screenshareDenied: false,
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
    setScreenShareConfig: (state, { payload }: PayloadAction<ScreenShareConfig>) => {
      state.screenShareConfig = payload;
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
      state.permission.audioDenied = payload;
    },
    setVideoPermissionDenied: (state, { payload }: PayloadAction<boolean>) => {
      state.permission.videoDenied = payload;
    },
    setMediaChangeInProgress: (state, { payload }: PayloadAction<MediaDeviceKindExtended | null>) => {
      state.mediaChangeInProgress = payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(startMedia.pending, (state, { meta: { arg } }) => {
      const { kind, forceDisableAudioBeforePromptIsShown } = arg;
      if (forceDisableAudioBeforePromptIsShown && kind === 'audioinput') {
        state.audioEnabled = false;
      }
      state.mediaChangeInProgress = arg.kind;
    });
    builder.addCase(startMedia.rejected, (state, { payload }) => {
      if (payload?.statusText === MediaError.NotAllowedError) {
        if (payload.kind === 'audioinput') {
          state.permission.audioDenied = true;
        }
        if (payload.kind === 'videoinput') {
          state.permission.videoDenied = true;
        }
      }
      state.mediaChangeInProgress = null;
    });
    builder.addCase(startMedia.fulfilled, (state, { payload }) => {
      if (payload.kind === 'audioinput') {
        state.audioEnabled = payload.enabled;
        state.permission.audioDenied = false;
        state.audioDeviceId = payload.deviceId;
      }
      if (payload.kind === 'videoinput') {
        state.videoEnabled = payload.enabled;
        state.permission.videoDenied = false;
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
  setScreenShareConfig,
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
export const selectScreenShareConfig = (state: RootState) => state.media.screenShareConfig;
export const selectAudioPermissionDenied = (state: RootState) => state.media.permission.audioDenied;
export const selectVideoPermissionDenied = (state: RootState) => state.media.permission.videoDenied;
export const selectScreensharePermissionDenied = (state: RootState) => state.media.permission.screenshareDenied;
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

const startBackgroundEffectsListener = (startAppListening: StartAppListening) =>
  startAppListening({
    matcher: isAnyOf(setBackgroundEffects),
    effect: (_, listenerApi) => {
      const state = listenerApi.getState();
      const { videoBackgroundEffects } = state.media;

      if (state.livekit.accessToken === undefined) {
        return;
      }

      const localParticipant = getLivekitRoom().localParticipant;
      const videotrack = localParticipant.getTrackPublication(Track.Source.Camera)?.videoTrack;

      if (videotrack) {
        if (videoBackgroundEffects.style === 'off') {
          videotrack.stopProcessor();
        } else {
          videotrack.setProcessor(new BackgroundBlur(videoBackgroundEffects));
        }
      }
    },
  });

export const startMediaListeners = (startAppListening: StartAppListening) => {
  startDisableMediaOnCoffeeBreakListener(startAppListening);
  startMediaChoiceListener(startAppListening);
  startBackgroundEffectsListener(startAppListening);
};
