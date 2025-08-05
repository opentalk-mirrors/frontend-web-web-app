// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ChatBase, ChatHistory, ChatScope, GroupId, NamespacedIncoming, ParticipantId } from '../../../types';

interface MessageSent extends ChatBase {
  message: 'message_sent';
}

export interface ChatEnabled {
  message: 'chat_enabled';
  id: ParticipantId;
}

interface ChatDisabled {
  message: 'chat_disabled';
  id: ParticipantId;
}

export interface ClearGlobalChat {
  message: 'history_cleared';
}

export interface RoomChatHistoryChunk {
  message: 'room_chat_history_chunk';
  history: ChatHistory;
}

export interface GroupChatHistoryChunk {
  message: 'group_chat_history_chunk';
  id: GroupId;
  name: string;
  history: ChatHistory;
}

export interface PrivateChatHistoryChunk {
  message: 'private_chat_history_chunk';
  correspondent: ParticipantId;
  history: ChatHistory;
}

export interface SearchResults {
  message: 'search_results';
  matches: ChatHistory;
  scope: ChatScope;
}

export type ChatMessage =
  | MessageSent
  | ChatEnabled
  | ChatDisabled
  | ClearGlobalChat
  | RoomChatHistoryChunk
  | GroupChatHistoryChunk
  | PrivateChatHistoryChunk
  | SearchResults;

export type Chat = NamespacedIncoming<ChatMessage, 'chat'>;

export default Chat;
