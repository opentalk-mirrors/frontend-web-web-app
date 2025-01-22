// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import RaiseHandOff from './source/raise-hand-off.svg?react';

const RaiseHandOffIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={RaiseHandOff} />;

export default RaiseHandOffIcon;
