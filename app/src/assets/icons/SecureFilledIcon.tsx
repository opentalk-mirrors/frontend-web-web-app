// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import SecureFilled from './source/secure-filled.svg?react';

const SecureFilledIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={SecureFilled} />;

export default SecureFilledIcon;
