// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import Forward from './source/forward.svg?react';

const ForwardIcon = (props: SvgIconProps) => <SvgIcon {...props} component={Forward} inheritViewBox />;

export default ForwardIcon;
