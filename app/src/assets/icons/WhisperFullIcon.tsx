// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import WhisperFull from './source/whisper-full.svg?react';

const WhisperFullIcon = (props: SvgIconProps) => <SvgIcon {...props} component={WhisperFull} inheritViewBox />;

export default WhisperFullIcon;
