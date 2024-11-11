// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import ArrowDown from './source/arrow-down.svg?react';

const ArrowDownIcon = (props: SvgIconProps) => <SvgIcon {...props} component={ArrowDown} inheritViewBox />;

export default ArrowDownIcon;
