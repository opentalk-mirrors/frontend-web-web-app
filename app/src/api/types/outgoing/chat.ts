// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { RootState } from '../../../store';
import { ChatIdentifier, ChatScope, Namespaced, Timestamp, createModule, TargetId } from '../../../types';
import { createSignalingApiCall } from '../../createSignalingApiCall';
import { ClearGlobalMessages, sendMessage } from './common';

type SendMessage = {
  action: 'send_message';
  content: string;
} & ChatIdentifier;

type EnableChat = {
  action: 'enable_chat';
};

type DisableChat = {
  action: 'disable_chat';
};

type LastSeenTimestampAddedPayloadBase = {
  timestamp: Timestamp;
};

export type LastSeenTimestampAddedPayload = ChatIdentifier & LastSeenTimestampAddedPayloadBase;

export type SetLastSeenTimestamp = {
  action: 'set_last_seen_timestamp';
  timestamp: Timestamp;
} & ChatIdentifier;

interface GetHistoryChunk {
  action: 'get_history_chunk';
  scope: ChatScope;
  messageIndex: number;
  target?: TargetId;
}

interface SearchHistory {
  action: 'search_history';
  scope: ChatScope;
  term: string;
  messageIndex?: number;
}

export type Action = SetLastSeenTimestamp | SendMessage | EnableChat | DisableChat | GetHistoryChunk | SearchHistory;

export type Chat = Namespaced<Action, 'chat'>;

export const sendChatMessage = createSignalingApiCall<SendMessage>('chat', 'send_message');
export const enableChat = createSignalingApiCall<EnableChat>('chat', 'enable_chat');
export const disableChat = createSignalingApiCall<DisableChat>('chat', 'disable_chat');

export const setLastSeenTimestamp = createSignalingApiCall<SetLastSeenTimestamp>('chat', 'set_last_seen_timestamp');
export const getHistoryChunk = createSignalingApiCall<GetHistoryChunk>('chat', 'get_history_chunk');
export const searchHistory = createSignalingApiCall<SearchHistory>('chat', 'search_history');

export const clearGlobalChatMessages = createSignalingApiCall<ClearGlobalMessages>('chat', 'clear_history');

export const handler = createModule<RootState>((builder) => {
  builder
    .addCase(sendChatMessage.action, (_state, action) => {
      sendMessage(sendChatMessage(action.payload));
    })
    .addCase(enableChat.action, () => {
      sendMessage(enableChat());
    })
    .addCase(disableChat.action, () => {
      sendMessage(disableChat());
    })
    .addCase(clearGlobalChatMessages.action, () => {
      sendMessage(clearGlobalChatMessages());
    })
    .addCase(setLastSeenTimestamp.action, (_state, action) => {
      sendMessage(setLastSeenTimestamp(action.payload));
    })
    .addCase(getHistoryChunk.action, (_state, action) => {
      sendMessage(getHistoryChunk(action.payload));
    })
    .addCase(searchHistory.action, (_state, action) => {
      sendMessage(searchHistory(action.payload));
    });
});

export default Chat;
