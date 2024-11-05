// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import ConnectionBad from './source/connection-bad.svg?react';

const ConnectionBadIcon = (props: SvgIconProps) => <SvgIcon {...props} component={ConnectionBad} inheritViewBox />;

export default ConnectionBadIcon;
