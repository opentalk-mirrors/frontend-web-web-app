// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Timer from './source/timer.svg?react';

const TimerIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Timer} />;

export default TimerIcon;
