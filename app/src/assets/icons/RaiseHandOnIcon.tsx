// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import RaiseHandOn from './source/raise-hand-on.svg?react';

const RaiseHandOnIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={RaiseHandOn} />;

export default RaiseHandOnIcon;
