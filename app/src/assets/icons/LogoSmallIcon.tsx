// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import LogoSmall from './source/logo-small.svg?react';

const LogoSmallIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={LogoSmall} />;

export default LogoSmallIcon;
