// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import Clock from './source/clock.svg?react';

const ClockIcon = (props: SvgIconProps) => <SvgIcon {...props} component={Clock} inheritViewBox />;

export default ClockIcon;
