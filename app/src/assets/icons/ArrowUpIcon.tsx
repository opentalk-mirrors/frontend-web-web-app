// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import ArrowUp from './source/arrow-up.svg?react';

const ArrowUpIcon = (props: SvgIconProps) => <SvgIcon {...props} component={ArrowUp} inheritViewBox />;

export default ArrowUpIcon;
