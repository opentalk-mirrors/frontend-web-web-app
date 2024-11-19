// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import Logo from './source/logo.svg?react';

const LogoIcon = (props: SvgIconProps) => <SvgIcon {...props} component={Logo} inheritViewBox />;

export default LogoIcon;
