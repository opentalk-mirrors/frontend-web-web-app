// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Burgermenu from './source/burgermenu.svg?react';

const BurgermenuIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Burgermenu} />;

export default BurgermenuIcon;
