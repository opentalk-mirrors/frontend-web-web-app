// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import Menubook from './source/menubook.svg?react';

const MenubookIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={Menubook} />;

export default MenubookIcon;
