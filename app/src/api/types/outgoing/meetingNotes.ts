// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { RootState } from '../../../store';
import { createModule, Namespaced, ParticipantId } from '../../../types';
import { createSignalingApiCall } from '../../createSignalingApiCall';
import { sendMessage } from './common';

export interface SelectMeetingNotesAccess {
  action: 'select_writer' | 'deselect_writer';
  participantIds: Array<ParticipantId>;
}

export interface GeneratePdf {
  action: 'generate_pdf';
}

export type Action = SelectMeetingNotesAccess | GeneratePdf;
export type MeetingNotes = Namespaced<Action, 'meeting_notes'>;

export const selectWriter = createSignalingApiCall<SelectMeetingNotesAccess>('meeting_notes', 'select_writer');
export const deselectWriter = createSignalingApiCall<SelectMeetingNotesAccess>('meeting_notes', 'deselect_writer');
export const uploadPdf = createSignalingApiCall<GeneratePdf>('meeting_notes', 'generate_pdf');

export const handler = createModule<RootState>((builder) => {
  builder.addCase(selectWriter.action, (_state, action) => {
    sendMessage(selectWriter(action.payload));
  });
  builder.addCase(deselectWriter.action, (_state, action) => {
    sendMessage(deselectWriter(action.payload));
  });
  builder.addCase(uploadPdf.action, (_state, action) => {
    sendMessage(uploadPdf(action.payload));
  });
});

export default MeetingNotes;
