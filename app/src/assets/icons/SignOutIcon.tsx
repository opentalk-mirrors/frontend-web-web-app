// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import SignOut from './source/sign-out.svg?react';

const SignOutIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={SignOut} />;

export default SignOutIcon;
