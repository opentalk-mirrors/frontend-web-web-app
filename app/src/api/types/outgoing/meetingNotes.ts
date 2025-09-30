// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { RootState } from '../../../store';
import { createModule, Namespaced, ParticipantId } from '../../../types';
import { createSignalingApiCall } from '../../createSignalingApiCall';
import { sendMessage } from './common';

export interface GrantWriteAccess {
  action: 'grant_write_access';
  participantIds: Array<ParticipantId>;
}

export interface RevokeWriteAccess {
  action: 'revoke_write_access';
  participantIds: Array<ParticipantId>;
}

export interface GeneratePdf {
  action: 'generate_pdf';
}

export type Action = GrantWriteAccess | RevokeWriteAccess | GeneratePdf;
export type MeetingNotes = Namespaced<Action, 'meeting_notes'>;

export const grantWriteAccess = createSignalingApiCall<GrantWriteAccess>('meeting_notes', 'grant_write_access');
export const revokeWriteAccess = createSignalingApiCall<RevokeWriteAccess>('meeting_notes', 'revoke_write_access');
export const uploadPdf = createSignalingApiCall<GeneratePdf>('meeting_notes', 'generate_pdf');

export const handler = createModule<RootState>((builder) => {
  builder.addCase(grantWriteAccess.action, (_state, action) => {
    sendMessage(grantWriteAccess(action.payload));
  });
  builder.addCase(revokeWriteAccess.action, (_state, action) => {
    sendMessage(revokeWriteAccess(action.payload));
  });
  builder.addCase(uploadPdf.action, (_state, action) => {
    sendMessage(uploadPdf(action.payload));
  });
});

export default MeetingNotes;
