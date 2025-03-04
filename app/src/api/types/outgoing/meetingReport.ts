// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { RootState } from '../../../store';
import { createModule, Namespaced } from '../../../types';
import { createSignalingApiCall } from '../../createSignalingApiCall';
import { sendMessage } from './common';

export interface GenerateAttendanceReport {
  action: 'generate_attendance_report';
  includeEmailAddresses: boolean;
}

export type Action = GenerateAttendanceReport;
export type MeetingReport = Namespaced<Action, 'meeting_report'>;

export const generateAttendanceReport = createSignalingApiCall<GenerateAttendanceReport>(
  'meeting_report',
  'generate_attendance_report'
);

export const handler = createModule<RootState>((builder) => {
  builder.addCase(generateAttendanceReport.action, (_state, action) => {
    sendMessage(generateAttendanceReport(action.payload));
  });
});

export default MeetingReport;
