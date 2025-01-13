// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Search from './source/search.svg?react';

const SearchIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Search} />;

export default SearchIcon;
