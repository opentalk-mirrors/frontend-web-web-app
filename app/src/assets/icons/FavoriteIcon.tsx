// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import Favorite from './source/favorite.svg?react';

const FavoriteIcon = (props: SvgIconProps) => <SvgIcon {...props} component={Favorite} inheritViewBox />;

export default FavoriteIcon;
