// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import SpeedTest from './source/speed-test.svg?react';

const SpeedTestIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={SpeedTest} />;

export default SpeedTestIcon;
