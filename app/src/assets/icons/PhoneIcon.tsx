// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import Phone from './source/phone.svg?react';

const PhoneIcon = (props: SvgIconProps) => <SvgIcon {...props} component={Phone} inheritViewBox />;

export default PhoneIcon;
