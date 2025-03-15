// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { RootState } from '../../../store';
import { createModule, Namespaced, ChatScope, TargetId } from '../../../types';
import { createSignalingApiCall } from '../../createSignalingApiCall';
import { sendMessage, ClearGlobalMessages } from './common';

interface ChatActionBase {
  content: string;
}
interface SendMessage extends ChatActionBase {
  action: 'send_message';
  target?: TargetId;
  scope: ChatScope;
}
interface EnableChat {
  action: 'enable_chat';
}

interface DisableChat {
  action: 'disable_chat';
}

export interface LastSeenTimestampAddedPayload {
  scope: ChatScope;
  timestamp: string;
  target?: TargetId;
}

interface SetLastSeenTimestamp extends LastSeenTimestampAddedPayload {
  action: 'set_last_seen_timestamp';
}

export type Action = SetLastSeenTimestamp | SendMessage | EnableChat | DisableChat;

export type Chat = Namespaced<Action, 'chat'>;

export const sendChatMessage = createSignalingApiCall<SendMessage>('chat', 'send_message');
export const enableChat = createSignalingApiCall<EnableChat>('chat', 'enable_chat');
export const disableChat = createSignalingApiCall<DisableChat>('chat', 'disable_chat');

export const setLastSeenTimestamp = createSignalingApiCall<SetLastSeenTimestamp>('chat', 'set_last_seen_timestamp');

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
    });
});

export default Chat;
