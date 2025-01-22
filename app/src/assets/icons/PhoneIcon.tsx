// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Phone from './source/phone.svg?react';

const PhoneIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Phone} />;

export default PhoneIcon;
