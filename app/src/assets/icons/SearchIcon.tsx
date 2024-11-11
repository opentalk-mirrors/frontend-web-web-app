// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import Search from './source/search.svg?react';

const SearchIcon = (props: SvgIconProps) => <SvgIcon {...props} component={Search} inheritViewBox />;

export default SearchIcon;
