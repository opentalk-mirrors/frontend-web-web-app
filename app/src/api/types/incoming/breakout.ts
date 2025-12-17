// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
//! Incoming Breakout Room related messages
import {
  BreakoutRoom,
  BreakoutRoomId,
  ErrorStruct,
  NamespacedIncoming,
  ParticipantId,
  ParticipantInOtherRoom,
} from '../../../types';
import { isEnumErrorStruct } from '../../../utils/tsUtils';

export interface AssocParticipantInOtherRoom {
  breakoutRoom?: BreakoutRoomId;
  id: ParticipantId;
}

export interface Started {
  message: 'started';
  rooms: Array<BreakoutRoom>;
  assignment?: BreakoutRoomId;
  expires?: string;
}

export interface Stopped {
  message: 'stopped';
}

export interface Expired {
  message: 'expired';
}

export interface Joined extends ParticipantInOtherRoom {
  message: 'joined';
}

export interface Left extends AssocParticipantInOtherRoom {
  message: 'left';
}

export enum BreakoutError {
  InsufficientPermissions = 'insufficient_permissions',
}

export const isError = isEnumErrorStruct(BreakoutError);

export type Message = Started | Stopped | Expired | Joined | Left | ErrorStruct<BreakoutError>;
export type Breakout = NamespacedIncoming<Message, 'breakout'>;

export default Breakout;
