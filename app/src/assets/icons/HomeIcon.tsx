// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import Home from './source/home.svg?react';

const HomeIcon = (props: SvgIconProps) => <SvgIcon {...props} component={Home} inheritViewBox />;

export default HomeIcon;
