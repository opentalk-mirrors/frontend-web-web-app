// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  ErrorStruct,
  KickReason,
  ModeratorJoinInfo,
  NamespacedIncoming,
  ParticipantId,
  Role,
  Timestamp,
  WaitingRoom,
} from '../../../types';

interface KickedParticipant {
  message: 'kicked';
  reason: KickReason;
}

interface BannedParticipant {
  message: 'banned';
}

interface ParticipantBanned {
  message: 'participant_banned';
  participantId: ParticipantId;
  displayName: string;
  avatarUrl: string;
  bannedBy: ParticipantId;
  bannedAt: Timestamp;
}

interface ParticipantUnbanned {
  message: 'participant_unbanned';
  participantId: ParticipantId;
}

export interface RoleUpdated {
  message: 'role_updated';
  participantId: ParticipantId;
  newRole: Role;
  moderatorData?: ModeratorJoinInfo;
  issuedBy: ParticipantId;
}

interface DebriefStarted {
  message: 'debriefing_started';
  issuedBy: ParticipantId;
}

interface WaitingRoomUpdated {
  message: 'waiting_room_updated';
  newState: WaitingRoom;
}

interface GuestAccessEnabled {
  message: 'guest_access_enabled';
}

interface GuestAccessDisabled {
  message: 'guest_access_disabled';
}

interface SentToWaitingRoom {
  message: 'sent_to_waiting_room';
}

interface AcceptedInMeeting {
  message: 'accepted';
}

interface ParticipantAccepted {
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

export interface DisplayNameAssigned {
  message: 'display_name_assigned';
  newName?: string;
}

interface DisplayNameChangeRestrictionsDisabled {
  message: 'display_name_change_restrictions_disabled';
}

interface DisplayNameChangeRestrictionsEnabled {
  message: 'display_name_change_restrictions_enabled';
}

interface Muted {
  message: 'muted';
  moderator: ParticipantId;
}

interface MicrophoneRestrictionsEnabled {
  message: 'microphone_restrictions_enabled';
  unrestrictedParticipants: Array<ParticipantId>;
}

interface MicrophoneRestrictionsDisabled {
  message: 'microphone_restrictions_disabled';
}

interface EntryPermissionChanged {
  message: 'entry_permission_changed';
  canEnter: boolean;
}

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
  | WaitingRoomUpdated
  | GuestAccessEnabled
  | GuestAccessDisabled
  | SentToWaitingRoom
  | AcceptedInMeeting
  | ParticipantAccepted
  | DisplayNameChanged
  | DisplayNameAssigned
  | DisplayNameChangeRestrictionsDisabled
  | DisplayNameChangeRestrictionsEnabled
  | Muted
  | MicrophoneRestrictionsEnabled
  | MicrophoneRestrictionsDisabled
  | EntryPermissionChanged
  | ErrorStruct<ModerationError>;

type Moderation = NamespacedIncoming<Message, 'moderation'>;

export default Moderation;
