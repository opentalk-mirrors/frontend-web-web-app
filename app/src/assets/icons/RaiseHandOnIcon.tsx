// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import RaiseHandOn from './source/raise-hand-on.svg?react';

const RaiseHandOnIcon = (props: SvgIconProps) => <SvgIcon {...props} component={RaiseHandOn} inheritViewBox />;

export default RaiseHandOnIcon;
