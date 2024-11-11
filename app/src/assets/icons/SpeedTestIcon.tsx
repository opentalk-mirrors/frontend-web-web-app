// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import SpeedTest from './source/speed-test.svg?react';

const SpeedTestIcon = (props: SvgIconProps) => <SvgIcon {...props} component={SpeedTest} inheritViewBox />;

export default SpeedTestIcon;
