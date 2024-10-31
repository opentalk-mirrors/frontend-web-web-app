// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import WhisperEmpty from './source/whisper-empty.svg?react';

const WhisperEmptyIcon = (props: SvgIconProps) => <SvgIcon {...props} component={WhisperEmpty} inheritViewBox />;

export default WhisperEmptyIcon;
