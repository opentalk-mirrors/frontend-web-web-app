// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import AddUser from './source/add-user.svg?react';

const AddUserIcon = (props: SvgIconProps) => <SvgIcon {...props} component={AddUser} inheritViewBox />;

export default AddUserIcon;
