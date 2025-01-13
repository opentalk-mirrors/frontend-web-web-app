// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import LogoGradient from './source/logoGradient.svg?react';

const LogoGradientIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={LogoGradient} />;

export default LogoGradientIcon;
