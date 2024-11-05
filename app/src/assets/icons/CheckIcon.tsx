// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import Check from './source/check.svg?react';

const CheckIcon = (props: SvgIconProps) => <SvgIcon {...props} component={Check} inheritViewBox />;

export default CheckIcon;
