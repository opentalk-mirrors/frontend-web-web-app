// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { RootState } from '../../../store';
import { Namespaced, ParticipantId, WhisperId, createModule, createSignalingApiCall } from '../../../types';
import { sendMessage } from '../../index';

export interface CreateWhisperGroup {
  action: 'create_whisper_group';
  participantIds: Array<ParticipantId>;
}

export interface InviteToWhisperGroup {
  action: 'invite_to_whisper_group';
  whisperId: WhisperId;
  participantIds: Array<ParticipantId>;
}

export interface AcceptWhisperInvite {
  action: 'accept_whisper_invite';
  whisperId: WhisperId;
}

export interface DeclineWhisperInvite {
  action: 'decline_whisper_invite';
  whisperId: WhisperId;
}

export interface LeaveWhisperGroup {
  action: 'leave_whisper_group';
  whisperId: WhisperId;
}

export type Action =
  | CreateWhisperGroup
  | InviteToWhisperGroup
  | AcceptWhisperInvite
  | DeclineWhisperInvite
  | LeaveWhisperGroup;

export type SubroomAudio = Namespaced<Action, 'subroom_audio'>;

export const requestWhisperGroup = createSignalingApiCall<CreateWhisperGroup>('subroom_audio', 'create_whisper_group');
export const inviteToWhisperGroup = createSignalingApiCall<InviteToWhisperGroup>(
  'subroom_audio',
  'invite_to_whisper_group'
);
export const acceptWhisperInvite = createSignalingApiCall<AcceptWhisperInvite>(
  'subroom_audio',
  'accept_whisper_invite'
);
export const declineWhisperInvite = createSignalingApiCall<DeclineWhisperInvite>(
  'subroom_audio',
  'decline_whisper_invite'
);
export const leaveWhisperGroup = createSignalingApiCall<LeaveWhisperGroup>('subroom_audio', 'leave_whisper_group');

export const handler = createModule<RootState>((builder) => {
  builder.addCase(requestWhisperGroup.action, (_state, action) => {
    sendMessage(requestWhisperGroup(action.payload));
  });
  builder.addCase(inviteToWhisperGroup.action, (_state, action) => {
    sendMessage(inviteToWhisperGroup(action.payload));
  });
  builder.addCase(acceptWhisperInvite.action, (_state, action) => {
    sendMessage(acceptWhisperInvite(action.payload));
  });
  builder.addCase(declineWhisperInvite.action, (_state, action) => {
    sendMessage(declineWhisperInvite(action.payload));
  });
  builder.addCase(leaveWhisperGroup.action, (_state, action) => {
    sendMessage(leaveWhisperGroup(action.payload));
  });
});

export default SubroomAudio;
