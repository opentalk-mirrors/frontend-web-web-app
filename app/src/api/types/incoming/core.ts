// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type {
  JoinSuccessRoomserver,
  NamespacedIncoming,
  ParticipantId,
  PeerModuleData,
  ConnectionId,
  JoinedWaitingRoomParticipant,
} from '../../../types';
import { isErrorStruct } from '../../../utils/tsUtils';

export interface JoinSuccess extends JoinSuccessRoomserver {
  message: 'join_success';
}

export interface ParticipantConnected {
  message: 'participant_connected';
  participantId: ParticipantId;
  connectionId: ConnectionId;
  peerData: PeerModuleData;
}

export interface JoinBlocked {
  message: 'join_blocked';
  reason: JoinBlockedReason;
}

export enum JoinBlockedReason {
  /// The participant limit for the meeting's tariff has been reached
  ParticipantLimitReached = 'participant_limit_reached',
}

export interface ParticipantDisconnected {
  message: 'participant_disconnected';
  participantId: ParticipantId;
  connectionId: ConnectionId;
  reason: DisconnectReason;
}

export enum DisconnectReason {
  Leave = 'leave',
  ConnectionLost = 'connection_lost',
  Kicked = 'kicked',
  Banned = 'banned',
  InternalError = 'internal_error',
  SentToWaitingRoom = 'sent_to_waiting_room',
}

// Signals to moderator that a participant has joined the waiting room.
export interface JoinedWaitingRoom extends JoinedWaitingRoomParticipant {
  message: 'joined_waiting_room';
}

// Signals to moderator that a participant has left the waiting room.
export interface LeftWaitingRoom {
  message: 'left_waiting_room';
  id: ParticipantId;
  connectionId: ConnectionId;
}

export interface InWaitingRoom {
  message: 'in_waiting_room';
  participantId: ParticipantId;
  connectionId: ConnectionId;
}

export interface Closing {
  message: 'closing';
  reason: RoomCloseReason;
}

export enum RoomCloseReason {
  GracefulShutdown = 'graceful_shutdown',
  ImmediateShutdown = 'immediate_shutdown',
  FatalError = 'fatal_error',
  TimeLimitReached = 'time_limit_reached',
  IdleTimeoutReached = 'idle_timeout_reached',
}

export const isError = isErrorStruct;

export type Message =
  | JoinSuccess
  | ParticipantConnected
  | JoinBlocked
  | ParticipantDisconnected
  | InWaitingRoom
  | JoinedWaitingRoom
  | LeftWaitingRoom
  | Closing;

export enum RoomserverMessageKey {
  JoinSuccess = 'join_success',
  ParticipantConnected = 'participant_connected',
  ParticipantDisconnected = 'participant_disconnected',
  InWaitingRoom = 'in_waiting_room',
  JoinedWaitingRoom = 'joined_waiting_room',
  LeftWaitingRoom = 'left_waiting_room',
}

export type RoomserverCore = NamespacedIncoming<Message, 'core'>;

export default RoomserverCore;
