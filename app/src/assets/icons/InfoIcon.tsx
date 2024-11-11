// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import Info from './source/info.svg?react';

const InfoIcon = (props: SvgIconProps) => <SvgIcon {...props} component={Info} inheritViewBox />;

export default InfoIcon;
