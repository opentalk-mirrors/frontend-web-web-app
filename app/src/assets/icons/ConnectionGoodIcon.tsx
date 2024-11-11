// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import ConnectionGood from './source/connection-good.svg?react';

const ConnectionGoodIcon = (props: SvgIconProps) => <SvgIcon {...props} component={ConnectionGood} inheritViewBox />;

export default ConnectionGoodIcon;
