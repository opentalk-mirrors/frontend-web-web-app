// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import WheelOfNames from './source/wheel-of-names.svg?react';

const WheelOfNamesIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={WheelOfNames} />;

export default WheelOfNamesIcon;
