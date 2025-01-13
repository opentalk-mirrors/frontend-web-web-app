// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import AttendanceReport from './source/attendance-report.svg?react';

const AttendanceReportIcon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={AttendanceReport} />;

export default AttendanceReportIcon;
