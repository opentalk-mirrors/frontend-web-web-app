// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import More from './source/more.svg?react';

const MoreIcon = (props: SvgIconProps) => <SvgIcon {...props} component={More} inheritViewBox />;

export default MoreIcon;
