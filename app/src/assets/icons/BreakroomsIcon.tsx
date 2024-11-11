// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import Breakrooms from './source/breakrooms.svg?react';

const BreakroomsIcon = (props: SvgIconProps) => <SvgIcon {...props} component={Breakrooms} inheritViewBox />;

export default BreakroomsIcon;
