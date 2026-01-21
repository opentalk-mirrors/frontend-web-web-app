// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
//! Incoming Breakout Room related messages
import {
  BreakoutRoom,
  BreakoutRoomId,
  ErrorStruct,
  ModuleData,
  NamespacedIncoming,
  ParticipantId,
  RoomKindBreakout,
  RoomKindMain,
  Timestamp,
} from '../../../types';
import { isEnumErrorStruct } from '../../../utils/tsUtils';

export interface Started {
  message: 'started';
  startedBy: ParticipantId;
  rooms: Array<BreakoutRoom>;
  expiresAt?: Timestamp;
  assignment?: BreakoutRoomId;
}

export interface ParticipantSwitchedRoom {
  message: 'participant_switched_room';
  participantId: ParticipantId;
  oldRoom: RoomKindMain | RoomKindBreakout;
  newRoom: RoomKindMain | RoomKindBreakout;
  moduleData?: ModuleData;
}

export interface SwitchedRoom {
  message: 'switched_room';
  ownData?: ModuleData;
  oldRoom: RoomKindMain | RoomKindBreakout;
  newRoom: RoomKindMain | RoomKindBreakout;
  peerData?: ModuleData;
}

export interface CloseNotice {
  message: 'close_notice';
  issuedBy: ParticipantId;
  stopsAt: Timestamp;
}

export interface Closing {
  message: 'closing';
  issuedBy: ParticipantId;
}

export interface Closed {
  message: 'closed';
}

export enum BreakoutError {
  InsufficientPermission = 'insufficient_permission',
  AlreadyActive = 'already_active',
  AlreadyInRoom = 'already_in_room',
  UnknownParticipant = 'unknown_participant',
  InvalidSelection = 'invalid_selection',
  UnknownBreakoutId = 'unknown_breakout_id',
  BreakoutInactive = 'breakout_inactive',
}

export const isError = isEnumErrorStruct(BreakoutError);

export type Message =
  | Started
  | ParticipantSwitchedRoom
  | SwitchedRoom
  | CloseNotice
  | Closing
  | Closed
  | ErrorStruct<BreakoutError>;
export type Breakout = NamespacedIncoming<Message, 'breakout'>;

export default Breakout;
