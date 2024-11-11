// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import Edit from './source/edit.svg?react';

const EditIcon = (props: SvgIconProps) => <SvgIcon {...props} component={Edit} inheritViewBox />;

export default EditIcon;
