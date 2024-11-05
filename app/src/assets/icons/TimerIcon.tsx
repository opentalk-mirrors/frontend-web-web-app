// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import Timer from './source/timer.svg?react';

const TimerIcon = (props: SvgIconProps) => <SvgIcon {...props} component={Timer} inheritViewBox />;

export default TimerIcon;
