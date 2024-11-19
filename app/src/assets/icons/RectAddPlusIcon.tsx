// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import RectAddPlus from './source/rect-add-plus.svg?react';

const RectAddPlusIcon = (props: SvgIconProps) => <SvgIcon {...props} component={RectAddPlus} inheritViewBox />;

export default RectAddPlusIcon;
