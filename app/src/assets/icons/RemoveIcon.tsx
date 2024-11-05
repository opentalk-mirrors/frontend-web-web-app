// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import Remove from './source/remove.svg?react';

const RemoveIcon = (props: SvgIconProps) => <SvgIcon {...props} component={Remove} inheritViewBox />;

export default RemoveIcon;
