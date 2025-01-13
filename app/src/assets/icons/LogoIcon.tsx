// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Logo from './source/logo.svg?react';

const LogoIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Logo} />;

export default LogoIcon;
