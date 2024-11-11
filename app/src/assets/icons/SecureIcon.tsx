// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import Secure from './source/secure.svg?react';

const SecureIcon = (props: SvgIconProps) => <SvgIcon {...props} component={Secure} inheritViewBox />;

export default SecureIcon;
