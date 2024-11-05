// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import AddPlus from './source/rect-add-plus.svg?react';

const AddWithRectangleIcon = (props: SvgIconProps) => <SvgIcon {...props} component={AddPlus} inheritViewBox />;

export default AddWithRectangleIcon;
