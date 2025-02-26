// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Accessablity from './source/accessablity.svg?react';

const AccessablityIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Accessablity} />;

export default AccessablityIcon;
