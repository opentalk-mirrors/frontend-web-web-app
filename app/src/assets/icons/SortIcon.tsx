// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import Sort from './source/sort.svg?react';

const SortIcon = (props: SvgIconProps) => <SvgIcon {...props} component={Sort} inheritViewBox />;

export default SortIcon;
