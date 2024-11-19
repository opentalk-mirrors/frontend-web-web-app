// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  BackendParticipant,
  ErrorStruct,
  NamespacedIncoming,
  ParticipantId,
  JoinSuccessIncoming,
} from '../../../types';
import { isErrorStruct } from '../../../utils/tsUtils';

interface AssociatedParticipant {
  id: ParticipantId;
}

export enum Role {
  Guest = 'guest',
  User = 'user',
  Moderator = 'moderator',
}

export interface JoinBlocked {
  message: 'join_blocked';
  reason: 'participant-limit-reached';
}

export interface Joined extends BackendParticipant {
  message: 'joined';
}

export interface Left extends AssociatedParticipant {
  message: 'left';
}

export interface Update extends BackendParticipant {
  message: 'update';
}

export interface TimeLimitQuotaElapsed {
  message: 'time_limit_quota_elapsed';
}

export interface RoleUpdated {
  message: 'role_updated';
  newRole: Role;
}

export interface HandRaised {
  message: 'hand_raised';
}

export interface HandLowered {
  message: 'hand_lowered';
}

export interface RoomDeleted {
  message: 'room_deleted';
}

export interface ModeratorRoleGranted {
  message: 'moderator_role_granted';
  target: ParticipantId;
}

export interface ModeratorRoleRevoked {
  message: 'moderator_role_revoked';
  target: ParticipantId;
}

// Currently this is a string
export type ControlError = string;

export const isError = isErrorStruct;

export type Message =
  | JoinSuccessIncoming
  | JoinBlocked
  | Update
  | Joined
  | Left
  | RoleUpdated
  | TimeLimitQuotaElapsed
  | ErrorStruct<ControlError>
  | HandRaised
  | HandLowered
  | RoomDeleted
  | ModeratorRoleGranted
  | ModeratorRoleRevoked;
export type Control = NamespacedIncoming<Message, 'control'>;

export default Control;
