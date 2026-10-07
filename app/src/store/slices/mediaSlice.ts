// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { VideoSetting } from '../../types';

interface ScreenShareConfig {
  resolution?: ScreenShareResolution;
  contentHint?: ContentHint;
}

enum ContentHint {
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

type MediaState = {
  qualityCap: VideoSetting;
  isUserSpeaking: boolean;
  screenShareConfig?: ScreenShareConfig;
};

export type MediaDeviceKindExtended = MediaDeviceKind | 'screenshare';

const initialState: MediaState = {
  qualityCap: VideoSetting.High,
  isUserSpeaking: false,
  screenShareConfig: {
    resolution: ScreenShareResolution.R1080p,
    contentHint: ContentHint.Text,
  },
};

const mediaSlice = createSlice({
  name: 'media',
  initialState,
  reducers: {
    setScreenShareConfig: (state, { payload }: PayloadAction<ScreenShareConfig>) => {
      state.screenShareConfig = payload;
    },
  },
});

export const { setScreenShareConfig } = mediaSlice.actions;

export default mediaSlice.reducer;
