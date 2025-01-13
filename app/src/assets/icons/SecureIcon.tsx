// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Secure from './source/secure.svg?react';

const SecureIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Secure} />;

export default SecureIcon;
