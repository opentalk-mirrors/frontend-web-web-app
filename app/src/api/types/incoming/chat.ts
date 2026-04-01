// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  BreakoutRoomId,
  ChatChunk,
  ChatScope,
  NamespacedIncoming,
  ParticipantId,
  Timestamp,
  ChatMessage as ChatMessageBase,
} from '../../../types';

export type MessageSent = ChatMessageBase & {
  message: 'message_sent';
};

export interface ChatEnabled {
  message: 'chat_enabled';
  issuedBy: ParticipantId;
}

interface ChatDisabled {
  message: 'chat_disabled';
  issuedBy: ParticipantId;
}

export interface ClearGlobalChat {
  message: 'history_cleared';
}

type SetLastSeenTimestampBase = {
  message: 'set_last_seen_timestamp';
  timestamp: Timestamp;
};

type SetGlobalLastSeenTimestamp = {
  scope: ChatScope.Global;
} & SetLastSeenTimestampBase;

type SetPrivateLastSeenTimestamp = {
  scope: ChatScope.Private;
  target: ParticipantId;
} & SetLastSeenTimestampBase;

type SetBreakoutLastSeenTimestamp = {
  scope: ChatScope.Breakout;
  target: BreakoutRoomId;
} & SetLastSeenTimestampBase;

export type SetLastSeenTimestamp =
  | SetGlobalLastSeenTimestamp
  | SetPrivateLastSeenTimestamp
  | SetBreakoutLastSeenTimestamp;

export interface RoomChatHistoryChunk {
  message: 'room_chat_history_chunk';
  history: ChatChunk;
}

export interface PrivateChatHistoryChunk {
  message: 'private_chat_history_chunk';
  correspondent: ParticipantId;
  history: ChatChunk;
}

export interface SearchResults {
  message: 'search_results';
  matches: ChatChunk;
  scope: ChatScope;
}

export type ChatMessage =
  | MessageSent
  | ChatEnabled
  | ChatDisabled
  | ClearGlobalChat
  | RoomChatHistoryChunk
  | PrivateChatHistoryChunk
  | SearchResults
  | SetLastSeenTimestamp;

export type Chat = NamespacedIncoming<ChatMessage, 'chat'>;

export default Chat;
