// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import Visible from './source/visible.svg?react';

const VisibleIcon = (props: SvgIconProps) => <SvgIcon {...props} component={Visible} inheritViewBox />;

export default VisibleIcon;
