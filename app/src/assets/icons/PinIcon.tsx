// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Pin from './source/pin.svg?react';

const PinIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Pin} />;

export default PinIcon;
