// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import ConnectionMedium from './source/connection-medium.svg?react';

const ConnectionMediumIcon = (props: SvgIconProps) => (
  <SvgIcon {...props} component={ConnectionMedium} inheritViewBox />
);

export default ConnectionMediumIcon;
