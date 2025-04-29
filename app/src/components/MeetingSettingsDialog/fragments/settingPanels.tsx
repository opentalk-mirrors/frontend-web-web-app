// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import React from 'react';

import AudioSettingsPanel from './AudioSettingsPanel';
import CameraSettingsPanel from './CameraSettingsPanel';
import ScreenShareSettingsPanel from './ScreenShareSettingsPanel';

export interface SettingsPanel {
  value: MeetingSettings;
  component: React.ReactNode;
}

export type MeetingSettings = 'audio' | 'camera' | 'screen-share';

const settingPanels: Array<SettingsPanel> = [
  {
    value: 'audio',
    component: <AudioSettingsPanel />,
  },
  {
    value: 'camera',
    component: <CameraSettingsPanel />,
  },
  {
    value: 'screen-share',
    component: <ScreenShareSettingsPanel />,
  },
];

export const getSettingPanels = () => settingPanels;
