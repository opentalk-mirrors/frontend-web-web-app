// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import AddUser from './source/add-user.svg?react';

const AddUserIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={AddUser} />;

export default AddUserIcon;
