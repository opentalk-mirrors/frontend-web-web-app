// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { BackendParticipant, NamespacedIncoming, ParticipantId } from '../../../types';

export interface KickedParticipant {
  message: 'kicked';
}

export interface BannedParticipant {
  message: 'banned';
}

export interface SentToWaitingRoom {
  message: 'sent_to_waiting_room';
}

export interface InWaitingRoom {
  message: 'in_waiting_room';
}

export interface WaitingRoomEnabled {
  message: 'waiting_room_enabled';
}

export interface WaitingRoomDisabled {
  message: 'waiting_room_disabled';
  id: ParticipantId;
}

export interface AcceptedInMeeting {
  message: 'accepted';
}

export interface HandraisesReset {
  message: 'raised_hand_reset_by_moderator';
}
export interface HandraisesDisabled {
  message: 'raise_hands_disabled';
}
export interface HandraisesEnabled {
  message: 'raise_hands_enabled';
}

export interface DebriefStarted {
  message: 'debriefing_started';
}
export interface DebriefSessionEnded {
  message: 'session_ended';
}

export interface DisplayNameChanged {
  message: 'display_name_changed';
  target: ParticipantId;
  issued_by: ParticipantId;
  oldName: string;
  newName: string;
}

/* MODERATOR ONLY */

// Signals to moderator that a participant has joined the waiting room.
export interface JoinedWaitingRoom extends BackendParticipant {
  message: 'joined_waiting_room';
}
// Signals to moderator that a participant has left the waiting room.
export interface leftWaitingRoom extends BackendParticipant {
  message: 'left_waiting_room';
  id: ParticipantId;
}

export type Message =
  | KickedParticipant
  | BannedParticipant
  | SentToWaitingRoom
  | InWaitingRoom
  | WaitingRoomEnabled
  | WaitingRoomDisabled
  | AcceptedInMeeting
  | JoinedWaitingRoom
  | leftWaitingRoom
  | HandraisesReset
  | HandraisesDisabled
  | HandraisesEnabled
  | DebriefStarted
  | DebriefSessionEnded
  | DisplayNameChanged;

export type Moderation = NamespacedIncoming<Message, 'moderation'>;

export default Moderation;
