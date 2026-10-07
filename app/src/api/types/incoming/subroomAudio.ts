// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ErrorStruct, NamespacedIncoming, ParticipantId, WhisperId, WhisperParticipant } from '../../../types';

interface WhisperGroupCreated {
  message: 'whisper_group_created';
  whisperId: WhisperId;
  participants: Array<WhisperParticipant>;
  token: string;
}

interface WhisperInvite {
  message: 'whisper_invite';
  whisperId: WhisperId;
  participants: Array<WhisperParticipant>;
  issuer: ParticipantId;
}

interface WhisperToken {
  message: 'whisper_token';
  whisperId: WhisperId;
  token: string;
}

interface ParticipantsInvited {
  message: 'participants_invited';
  whisperId: WhisperId;
  participantIds: Array<ParticipantId>;
}

interface WhisperInviteAccepted {
  message: 'whisper_invite_accepted';
  whisperId: WhisperId;
  participantId: ParticipantId;
}

interface WhisperInviteDeclined {
  message: 'whisper_invite_declined';
  whisperId: WhisperId;
  participantId: ParticipantId;
}

interface LeftWhisperGroup {
  message: 'left_whisper_group';
  whisperId: WhisperId;
  participantId: ParticipantId;
}

interface WhisperGroupDisbanded {
  message: 'whisper_group_disbanded';
  whisperId: WhisperId;
}

export enum SubroomAudioError {
  InvalidWhisperId = 'invalid_whisper_id',
  InsufficientPermissions = 'insufficient_permissions',
  EmptyParticipantList = 'empty_participant_list',
  InvalidParticipantTargets = 'invalid_participant_targets',
  LivekitUnavailable = 'livekit_unavailable',
  NotInvited = 'not_invited',
}

export type Message =
  | WhisperGroupCreated
  | WhisperInvite
  | WhisperToken
  | ParticipantsInvited
  | WhisperInviteAccepted
  | WhisperInviteDeclined
  | LeftWhisperGroup
  | WhisperGroupDisbanded
  | ErrorStruct<SubroomAudioError>;

type SubroomAudio = NamespacedIncoming<Message, 'subroom_audio'>;

export default SubroomAudio;
