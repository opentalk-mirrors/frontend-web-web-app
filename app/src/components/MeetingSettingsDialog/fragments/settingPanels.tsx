// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import React from 'react';

import { AudioSettingsPanel } from './AudioSettingsPanel';
import { VideoSettingsPanel } from './VideoSettingsPanel';

export interface SettingsPanel {
  value: MeetingSettings;
  component: React.ReactNode;
}

export type MeetingSettings = 'audio' | 'video';

const settingPanels: Array<SettingsPanel> = [
  {
    value: 'audio',
    component: <AudioSettingsPanel />,
  },
  {
    value: 'video',
    component: <VideoSettingsPanel />,
  },
];

export const getSettingPanels = () => settingPanels;
