// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import Hidden from './source/hidden.svg?react';

const HiddenIcon = (props: SvgIconProps) => <SvgIcon {...props} component={Hidden} inheritViewBox />;

export default HiddenIcon;
