// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIcon, SvgIconProps } from '@mui/material';

import AttendanceReport from './source/attendance-report.svg?react';

const AttendanceReportIcon = (props: SvgIconProps) => (
  <SvgIcon {...props} component={AttendanceReport} inheritViewBox />
);

export default AttendanceReportIcon;
