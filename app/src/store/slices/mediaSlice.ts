// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { VideoSetting } from '../../types';
import type { RootState } from '../index';

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

export enum NotificationKind {
  ForceMute = 'forceMute',
  RequestMute = 'requestMute',
}

export type MediaState = {
  qualityCap: VideoSetting;
  isUserSpeaking: boolean;
  screenShareConfig?: ScreenShareConfig;
};

export type MediaDeviceKindExtended = MediaDeviceKind | 'screenshare';

export const initialState: MediaState = {
  qualityCap: VideoSetting.High,
  isUserSpeaking: false,
  screenShareConfig: {
    resolution: ScreenShareResolution.R1080p,
    contentHint: ContentHint.Text,
  },
};

export const mediaSlice = createSlice({
  name: 'media',
  initialState,
  reducers: {
    setScreenShareConfig: (state, { payload }: PayloadAction<ScreenShareConfig>) => {
      state.screenShareConfig = payload;
    },
  },
});

export const { setScreenShareConfig } = mediaSlice.actions;

export const selectIsUserSpeaking = (state: RootState) => state.media.isUserSpeaking;
export const selectScreenShareConfig = (state: RootState) => state.media.screenShareConfig;

export const actions = mediaSlice.actions;

export const reHydrateSlice = () => {
  const storageItem = localStorage.getItem('mediaChoices');
  if (storageItem !== null) {
    return JSON.parse(storageItem);
  }

  return undefined;
};

export default mediaSlice.reducer;
