// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import Audio from './source/audio.svg?react';

const AudioIcon = (props: SvgIconProps) => <SvgIcon {...props} component={Audio} inheritViewBox />;

export default AudioIcon;
