// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ErrorStruct, NamespacedIncoming, ParticipantId, Role, Timestamp } from '../../../types';

export interface KickedParticipant {
  message: 'kicked';
}

export interface BannedParticipant {
  message: 'banned';
}

export interface ParticipantBanned {
  message: 'participant_banned';
  participantId: ParticipantId;
  display_name: string;
  avatar_url: string;
  bannedBy: ParticipantId;
  bannedAt: Timestamp;
}

export interface ParticipantUnbanned {
  message: 'participant_unbanned';
  participantId: ParticipantId;
}

export interface RoleUpdated {
  message: 'role_updated';
  participantId: ParticipantId;
  newRole: Role;
}

export interface DebriefStarted {
  message: 'debriefing_started';
  issuedBy: ParticipantId;
}

export interface WaitingRoomEnabled {
  message: 'waiting_room_enabled';
}

export interface WaitingRoomDisabled {
  message: 'waiting_room_disabled';
  id: ParticipantId;
}

export interface SentToWaitingRoom {
  message: 'sent_to_waiting_room';
}

export interface AcceptedInMeeting {
  message: 'accepted';
}

export interface ParticipantAccepted {
  message: 'participant_accepted';
  participantId: ParticipantId;
}

export interface DisplayNameChanged {
  message: 'display_name_changed';
  target: ParticipantId;
  issuedBy: ParticipantId;
  oldName: string;
  newName: string;
}

export interface DisplayNameChangeRestrictionsDisabled {
  message: 'display_name_change_restrictions_disabled';
}

export interface DisplayNameChangeRestrictionsEnabled {
  message: 'display_name_change_restrictions_enabled';
}

export interface Muted {
  message: 'muted';
  moderator: ParticipantId;
}

export interface MicrophoneRestrictionsEnabled {
  message: 'microphone_restrictions_enabled';
  unrestrictedParticipants: Array<ParticipantId>;
}

export interface MicrophoneRestrictionsDisabled {
  message: 'microphone_restrictions_disabled';
}

// export interface DebriefSessionEnded {
//   message: 'session_ended';
// }

export enum ModerationError {
  /// Cannot change the display name of registered users
  CannotChangeNameOfRegisteredUsers = 'cannot_change_name_of_registered_users',
  /// Invalid display name
  InvalidDisplayName = 'invalid_display_name',
  /// Insufficient permissions to perform a command
  InsufficientPermissions = 'insufficient_permissions',
  /// The requested participant is not connected
  UnknownParticipant = 'unknown_participant',
  /// The participant is not known.
  UnknownParticipants = 'unknown_participants',
  /// The participant is already banned
  AlreadyBanned = 'already_banned',
  /// The participant is already unbanned
  AlreadyUnbanned = 'already_unbanned',
  /// Can't ban the room owner
  CannotBanRoomOwner = 'cannot_ban_room_owner',
  /// Can't ban guests
  CannotBanGuests = 'cannot_ban_guests',
  /// Cannot ban oneself
  CannotBanSelf = 'cannot_ban_self',
  /// Cannot change the role of the room owner
  CannotChangeRoomOwnerRole = 'cannot_change_room_owner_role',
  /// The participant already has the role assigned
  RoleAlreadyAssigned = 'role_already_assigned',
  /// The participant is not in the waiting room
  NotWaiting = 'not_waiting',
  /// The participant cannot enter the room because they were not accepted by a moderator yet.
  NotAccepted = 'not_accepted',
  /// Cannot send the room owner to the waiting room
  CannotSendRoomOwnerToWaitingRoom = 'cannot_send_room_owner_to_waiting_room',
  /// The room owner cannot be kicked
  CannotKickRoomOwner = 'cannot_kick_room_owner',
  /// An internal error occurred
  Internal = 'internal',
  /// The received command cannot be executed since there is already a conflicting ongoing task.
  ConflictingTask = 'conflicting_task',
  /// The livekit server is not available
  LivekitUnavailable = 'livekit_unavailable',
  /// The user cannot be assigned as a moderator
  UserCannotBeModerator = 'user_cannot_be_moderator',
}

export type Message =
  | KickedParticipant
  | BannedParticipant
  | ParticipantBanned
  | ParticipantUnbanned
  | RoleUpdated
  | DebriefStarted
  | WaitingRoomEnabled
  | WaitingRoomDisabled
  | SentToWaitingRoom
  | AcceptedInMeeting
  | ParticipantAccepted
  | DisplayNameChanged
  | DisplayNameChangeRestrictionsDisabled
  | DisplayNameChangeRestrictionsEnabled
  | Muted
  | MicrophoneRestrictionsEnabled
  | MicrophoneRestrictionsDisabled
  | ErrorStruct<ModerationError>;

export type Moderation = NamespacedIncoming<Message, 'moderation'>;

export default Moderation;
