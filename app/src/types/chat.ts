// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { BreakoutRoomId } from './breakout';
import { ParticipantId, TargetId, Timestamp } from './common';

export enum ChatScope {
  Global = 'global',
  Private = 'private',
  Breakout = 'breakout',
}

type GlobalChatMessage = {
  scope: ChatScope.Global;
  target?: never;
};

type PrivateChatMessage = {
  scope: ChatScope.Private;
  target: ParticipantId;
};

type BreakoutChatMessage = {
  scope: ChatScope.Breakout;
  target: BreakoutRoomId;
};

export type ChatMessage = {
  id: string;
  timestamp: string;
  source: ParticipantId;
  content: string;
} & (GlobalChatMessage | PrivateChatMessage | BreakoutChatMessage);

export interface ChatMessageBase {
  id: string;
  source: ParticipantId;
  content: string;
}

export interface BaseMessageWithTimestamp extends ChatMessageBase {
  timestamp: Timestamp;
}

export interface ChatBase extends ChatMessageBase {
  scope: ChatScope;
  target?: TargetId;
}

export type ChatMessageWithTimestamp = ChatBase & BaseMessageWithTimestamp;

export interface InitialChat {
  enabled: boolean;
  globalHistory: ChatChunk;
  breakoutRoomHistory?: ChatChunk;
  privateHistory: Array<PrivateHistory>;
  lastSeenTimestampGlobal?: Timestamp;
  lastSeenTimestampBreakout?: Timestamp;
  lastSeenTimestampsPrivate: Record<string, string>;
}

export interface PrivateHistory {
  correspondent: ParticipantId;
  history: ChatChunk;
}

export interface ChatChunk {
  messages: Array<ChatMessage>;
  nextIndex: number | null;
}
