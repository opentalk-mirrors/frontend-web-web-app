// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { BreakoutRoomId } from './breakout';
import { ParticipantId, Timestamp } from './common';

export enum ChatScope {
  Global = 'global',
  Private = 'private',
  Breakout = 'breakout',
}

export type GlobalChatIdentifier = {
  scope: ChatScope.Global;
  target?: never;
};

export type PrivateChatIdentifier = {
  scope: ChatScope.Private;
  target: ParticipantId;
};

export type BreakoutChatIdentifier = {
  scope: ChatScope.Breakout;
  target: BreakoutRoomId;
};

export type ChatIdentifier = GlobalChatIdentifier | PrivateChatIdentifier | BreakoutChatIdentifier;

export type ChatMessage = {
  id: string;
  timestamp: string;
  source: ParticipantId;
  content: string;
} & ChatIdentifier;

export interface InitialChat {
  enabled: boolean;
  globalHistory: ChatChunk;
  breakoutRoomHistory?: Array<BreakoutHistory>;
  privateHistory: Array<PrivateHistory>;
  lastSeenTimestampGlobal?: Timestamp;
  lastSeenTimestampBreakout?: Timestamp;
  lastSeenTimestampsPrivate: Record<string, string>;
}

export interface PrivateHistory {
  correspondent: ParticipantId;
  history: ChatChunk;
}

export interface BreakoutHistory {
  room: BreakoutRoomId;
  history: ChatChunk;
}

export interface ChatChunk {
  messages: Array<ChatMessage>;
  nextIndex: number | null;
}
