// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import Add from './source/add.svg?react';

const AddIcon = (props: SvgIconProps) => <SvgIcon {...props} component={Add} inheritViewBox />;

export default AddIcon;
