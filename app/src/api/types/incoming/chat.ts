// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ChatBase, ChatChunk, ChatScope, NamespacedIncoming, ParticipantId, Timestamp } from '../../../types';

interface MessageSent extends ChatBase {
  message: 'message_sent';
}

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
export interface SetLastSeenTimestamp {
  message: 'set_last_seen_timestamp';
  scope: 'global' | 'private' | 'breakout';
  target?: ParticipantId;
  timestamp: Timestamp;
}

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
