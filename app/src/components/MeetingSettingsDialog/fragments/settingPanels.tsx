// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import React from 'react';

import AudioSettingsPanel from './AudioSettingsPanel';
import CameraSettingsPanel from './CameraSettingsPanel';
import InterfaceSettingsPanel from './InterfaceSettingsPanel';
// V2-CLEANUP
import ScreenShareSettingsPanel from './ScreenShareSettingsPanel';

export interface SettingsPanel {
  value: MeetingSettings;
  component: React.ReactNode;
}

// V2-CLEANUP: drop the 'interface' variant
export type MeetingSettings = 'audio' | 'camera' | 'screen-share' | 'interface';

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

// V2-CLEANUP: the v1/v2 switch panel, gated behind the v2 availability flag by the callers
const interfaceSettingsPanel: SettingsPanel = {
  value: 'interface',
  component: <InterfaceSettingsPanel />,
};

// V2-CLEANUP: drop the includeInterface option and return `settingPanels` directly
export const getSettingPanels = ({ includeInterface = false }: { includeInterface?: boolean } = {}) =>
  includeInterface ? [...settingPanels, interfaceSettingsPanel] : settingPanels;
