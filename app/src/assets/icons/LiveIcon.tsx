// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import Live from './source/live.svg?react';

const LiveIcon = (props: SvgIconProps) => <SvgIcon {...props} component={Live} inheritViewBox />;

export default LiveIcon;
