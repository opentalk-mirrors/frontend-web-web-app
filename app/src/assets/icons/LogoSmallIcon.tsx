// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import LogoSmall from './source/logo-small.svg?react';

const LogoSmallIcon = (props: SvgIconProps) => <SvgIcon {...props} component={LogoSmall} inheritViewBox />;

export default LogoSmallIcon;
