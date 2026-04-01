// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { RoomKind, Timestamp } from './common';

// counting id (0,1,2,3,...)
export type BreakoutRoomId = number & { readonly __tag: unique symbol };
export interface BreakoutRoom {
  id: BreakoutRoomId;
  name: string;
}

export type RoomKindMain = {
  kind: RoomKind.Main;
  id?: never;
};

export type RoomKindBreakout = {
  kind: RoomKind.Breakout;
  id: BreakoutRoomId;
};

export interface InitialBreakout {
  /// The current room of the participant
  room: RoomKindMain | RoomKindBreakout;
  /// Active breakout rooms
  rooms: Array<BreakoutRoom>;
  /// The expiry for all breakout rooms
  expires?: Timestamp;
}
