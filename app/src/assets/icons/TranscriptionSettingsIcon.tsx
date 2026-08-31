// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import IconTranscriptionSettings from './source/icon_transcription_settings.svg?react';

const TranscriptionSettingsIcon = (props: SvgIconProps) => (
  <AccessibleSvgIcon {...props} component={IconTranscriptionSettings} />
);

export default TranscriptionSettingsIcon;
