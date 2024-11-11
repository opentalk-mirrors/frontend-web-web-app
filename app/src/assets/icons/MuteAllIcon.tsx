// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import MuteAll from './source/mute-all.svg?react';

const MuteAllIcon = (props: SvgIconProps) => <SvgIcon {...props} component={MuteAll} inheritViewBox />;

export default MuteAllIcon;
