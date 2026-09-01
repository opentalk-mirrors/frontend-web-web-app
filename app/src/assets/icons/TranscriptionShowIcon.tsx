// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import IconTranscriptionShow from './source/icon_transcription_show.svg?react';

const TranscriptionShowIcon = (props: SvgIconProps) => (
  <AccessibleSvgIcon {...props} component={IconTranscriptionShow} />
);

export default TranscriptionShowIcon;
