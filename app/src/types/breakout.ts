// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { ParticipantId, ParticipationKind, RoomKind, Timestamp } from './common';

export type BreakoutRoomId = string & { readonly __tag: unique symbol };
export interface BreakoutRoom {
  id: BreakoutRoomId;
  name: string;
}

export interface ParticipantInOtherRoom {
  // BreakoutRoomId or null, null means the participant is in the parent room.
  breakoutRoom: BreakoutRoomId | null;
  id: string;
  participantId: ParticipantId;
  connectionId?: string;
  displayName: string;
  avatarUrl?: string;
  leftAt: string | null;
  participationKind: ParticipationKind;
}

export interface InitialBreakout {
  /// The current room of the participant
  room: RoomKind;
  /// Active breakout rooms
  rooms: Array<BreakoutRoom>;
  /// The expiry for all breakout rooms
  expires?: Timestamp;
}
