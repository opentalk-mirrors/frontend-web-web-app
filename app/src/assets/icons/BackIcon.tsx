// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import Back from './source/back.svg?react';

const BackIcon = (props: SvgIconProps) => <SvgIcon {...props} component={Back} inheritViewBox />;

export default BackIcon;
