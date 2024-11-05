// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import DashboardLegal from './source/dashboard-legal.svg?react';

const DashboardLegalIcon = (props: SvgIconProps) => <SvgIcon {...props} component={DashboardLegal} inheritViewBox />;

export default DashboardLegalIcon;
