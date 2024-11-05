// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import Pin from './source/pin.svg?react';

const PinIcon = (props: SvgIconProps) => <SvgIcon {...props} component={Pin} inheritViewBox />;

export default PinIcon;
