// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { PayloadAction, TypedStartListening, createListenerMiddleware, createSlice, isAnyOf } from '@reduxjs/toolkit';

import { AppDispatch, RootState } from '../';
import { RequestMute } from '../../api/types/incoming/media';
import { ParticipantId, VideoSetting } from '../../types';

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

interface MediaState {
  qualityCap: VideoSetting;
  upstreamLimit: VideoSetting;
  requestMuteNotification?: MuteNotification;
  isUserSpeaking: boolean;
  videoEnabled: boolean;
  videoDeviceId?: string;
  audioEnabled: boolean;
  audioDeviceId?: string;
  videoBackgroundEffects: BackgroundConfig & { loading?: boolean };
}

export const initialState: MediaState = {
  qualityCap: VideoSetting.High,
  upstreamLimit: VideoSetting.High,
  isUserSpeaking: false,
  videoEnabled: false,
  audioEnabled: false,
  videoBackgroundEffects: { style: 'off', loading: false },
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
    setAudioAndVideoEnabled: (state, { payload }: PayloadAction<AudioAndVideoUpdate>) => {
      state.audioEnabled = payload.audio;
      state.videoEnabled = payload.video;
    },
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
  setAudioAndVideoEnabled,
} = mediaSlice.actions;

export const selectIsUserSpeaking = (state: RootState) => state.media.isUserSpeaking;
export const selectUpstreamLimit = (state: RootState) => state.media.upstreamLimit;
export const selectNotification = (state: RootState) => state.media.requestMuteNotification;
export const selectAudioDeviceId = (state: RootState) => state.media.audioDeviceId;
export const selectVideoDeviceId = (state: RootState) => state.media.videoDeviceId;
export const selectAudioEnabled = (state: RootState) => state.media.audioEnabled;
export const selectVideoEnabled = (state: RootState) => state.media.videoEnabled;
export const selectVideoBackgroundEffects = (state: RootState) => state.media.videoBackgroundEffects;

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
