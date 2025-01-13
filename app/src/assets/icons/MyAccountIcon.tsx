// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import MyAccount from './source/my-account.svg?react';

const MyAccountIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={MyAccount} />;

export default MyAccountIcon;
