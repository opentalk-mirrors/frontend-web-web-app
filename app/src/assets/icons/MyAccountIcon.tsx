// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import MyAccount from './source/my-account.svg?react';

const MyAccountIcon = (props: SvgIconProps) => <SvgIcon {...props} component={MyAccount} inheritViewBox />;

export default MyAccountIcon;
