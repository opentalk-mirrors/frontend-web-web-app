// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { createSlice, PayloadAction, createListenerMiddleware, TypedStartListening } from '@reduxjs/toolkit';

import { RootState, AppDispatch } from '../';
import { RequestMute } from '../../api/types/incoming/media';
import { updateSpeakingState } from '../../api/types/outgoing/media';
import { BackgroundConfig } from '../../modules/Media/BackgroundBlur';
import { getCurrentConferenceRoom } from '../../modules/WebRTC';
import { ParticipantId, VideoSetting } from '../../types';

export enum NotificationKind {
  ForceMute = 'forceMute',
  RequestMute = 'requestMute',
}

interface MuteNotification {
  kind: NotificationKind;
  origin: ParticipantId;
}

interface MediaState {
  videoBackgroundEffects: BackgroundConfig & { loading?: boolean };
  qualityCap: VideoSetting;
  upstreamLimit: VideoSetting;
  requestMuteNotification?: MuteNotification;
  isUserSpeaking: boolean;
}

const initialState: MediaState = {
  videoBackgroundEffects: { style: 'off', loading: false },
  qualityCap: VideoSetting.High,
  upstreamLimit: VideoSetting.High,
  isUserSpeaking: false,
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
    setSpeakerActivity: (state, { payload }: PayloadAction<boolean>) => {
      state.isUserSpeaking = payload;
    },
    setQualityCap: (state, action: PayloadAction<VideoSetting>) => {
      state.qualityCap = action.payload;
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
  },
});

export const {
  setBackgroundEffects,
  setBackgroundEffectsLoading,
  setSpeakerActivity,
  setQualityCap,
  setUpstreamLimit,
  requestMute,
  notificationShown,
} = mediaSlice.actions;

export const selectVideoBackgroundEffects = (state: RootState) => state.media.videoBackgroundEffects;
export const selectIsUserSpeaking = (state: RootState) => state.media.isUserSpeaking;
export const selectQualityCap = (state: RootState) => state.media.qualityCap;
export const selectUpstreamLimit = (state: RootState) => state.media.upstreamLimit;
export const selectNotification = (state: RootState) => state.media.requestMuteNotification;

export const actions = mediaSlice.actions;

export const mediaMiddleware = createListenerMiddleware();
type AppStartListening = TypedStartListening<RootState, AppDispatch>;

const startAppListening = mediaMiddleware.startListening as AppStartListening;
startAppListening({
  actionCreator: setSpeakerActivity,
  effect: (action, listenerApi) => {
    const isInConference = getCurrentConferenceRoom() !== undefined;
    if (isInConference) {
      listenerApi.dispatch(updateSpeakingState.action({ isSpeaking: action.payload }));
    }
  },
});

export default mediaSlice.reducer;
