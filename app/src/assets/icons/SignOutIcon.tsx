// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import SignOut from './source/sign-out.svg?react';

const SignOutIcon = (props: SvgIconProps) => <SvgIcon {...props} component={SignOut} inheritViewBox />;

export default SignOutIcon;
