// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { EntityState, PayloadAction, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { isAfter } from 'date-fns';

import { PrivateChatHistoryChunk, RoomChatHistoryChunk } from '../../api/types/incoming/chat';
import { LastSeenTimestampAddedPayload } from '../../api/types/outgoing/chat';
import {
  BreakoutRoomId,
  ChatIdentifier,
  ChatMessage,
  ChatScope,
  ParticipantId,
  PrivateChatIdentifier,
  Timestamp,
} from '../../types';
import { joinSuccess } from '../commonActions';
import { UserState } from './userSlice';

export type ChatProps = {
  chatIdentifier: ChatIdentifier;
  messages: Array<ChatMessage>;
  lastMessage: ChatMessage;
};
export type PrivateChatProps = {
  chatIdentifier: PrivateChatIdentifier;
  messages: Array<ChatMessage>;
  lastMessage: ChatMessage;
};

const globalMessagesAdapter = createEntityAdapter<ChatMessage & { scope: ChatScope.Global }, ChatMessage['id']>({
  selectId: (message: ChatMessage) => `${message.source}@${message.timestamp}`,
  sortComparer: (a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp),
});

export const globalMessagesSelectors = globalMessagesAdapter.getSelectors();

const privateMessagesAdapter = createEntityAdapter<ChatMessage & { scope: ChatScope.Private }, ChatMessage['id']>({
  selectId: (message: ChatMessage) => `${message.source}@${message.timestamp}`,
  sortComparer: (a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp),
});

export const privateMessagesSelectors = privateMessagesAdapter.getSelectors();

const breakoutMessagesAdapter = createEntityAdapter<ChatMessage & { scope: ChatScope.Breakout }, ChatMessage['id']>({
  selectId: (message: ChatMessage) => `${message.source}@${message.timestamp}`,
  sortComparer: (a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp),
});

export const breakoutMessagesSelectors = breakoutMessagesAdapter.getSelectors();

export interface ChatState {
  settings: {
    enabled: boolean;
    changedAt?: Timestamp;
    changedBy?: ParticipantId;
  };
  scope: {
    global: {
      messages: EntityState<ChatMessage & { scope: ChatScope.Global }, ChatMessage['id']>;
      nextIndex: number | null;
      lastSeenTimestamp: Timestamp;
    };
    private: {
      [id: ParticipantId]: {
        messages: EntityState<ChatMessage & { scope: ChatScope.Private }, ChatMessage['id']>;
        nextIndex: number | null;
        lastSeenTimestamp: Timestamp;
      };
    };
    breakout: {
      [id: BreakoutRoomId]: {
        messages: EntityState<ChatMessage & { scope: ChatScope.Breakout }, ChatMessage['id']>;
        nextIndex: number | null;
        lastSeenTimestamp: Timestamp;
      };
    };
  };
  isLoadingMoreChunks: boolean;
  searchResults: ChatMessage[];
}

const initialState: ChatState = {
  settings: {
    enabled: true,
    changedAt: undefined,
    changedBy: undefined,
  },
  scope: {
    global: {
      messages: globalMessagesAdapter.getInitialState(),
      nextIndex: null,
      lastSeenTimestamp: new Date().toISOString() as Timestamp,
    },
    private: {},
    breakout: {},
  },
  isLoadingMoreChunks: false,
  searchResults: [],
};

const getPrivateMessageRecipient = (message: ChatMessage, currentUserId: ParticipantId): ParticipantId => {
  if (message.scope === ChatScope.Private) {
    return message.source === currentUserId ? message.target : message.source;
  }

  return message.source;
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    received: (
      state: ChatState,
      {
        payload: { chatMessage, userId },
      }: PayloadAction<{
        chatMessage: ChatMessage;
        userId: ParticipantId;
      }>
    ) => {
      switch (chatMessage.scope) {
        case ChatScope.Global:
          globalMessagesAdapter.addOne(state.scope.global.messages, chatMessage);
          break;

        case ChatScope.Private: {
          const { timestamp } = chatMessage;
          const recipient = getPrivateMessageRecipient(chatMessage, userId);
          if (!Reflect.has(state.scope.private, recipient)) {
            state.scope.private[recipient] = {
              messages: privateMessagesAdapter.getInitialState({}, [chatMessage]),
              nextIndex: null,
              lastSeenTimestamp: new Date(Date.parse(timestamp) - 1).toISOString() as Timestamp,
            };
          } else {
            privateMessagesAdapter.addOne(state.scope.private[recipient].messages, chatMessage);
          }
          break;
        }

        case ChatScope.Breakout: {
          const { target, timestamp } = chatMessage;
          if (!Reflect.has(state.scope.breakout, target)) {
            state.scope.breakout[target] = {
              messages: breakoutMessagesAdapter.getInitialState({}, [chatMessage]),
              nextIndex: null,
              lastSeenTimestamp: new Date(Date.parse(timestamp) - 1).toISOString() as Timestamp,
            };
          } else {
            breakoutMessagesAdapter.addOne(state.scope.breakout[target].messages, chatMessage);
          }
          break;
        }
      }
    },
    roomChatHistoryChunkReceived: (state, { payload }: PayloadAction<RoomChatHistoryChunk>) => {
      // Replace or prepend messages for global chat
      globalMessagesAdapter.addMany(
        state.scope.global.messages,
        payload.history.messages.filter(
          (msg): msg is ChatMessage & { scope: ChatScope.Global } => msg.scope === ChatScope.Global
        )
      );
      state.scope.global.nextIndex = payload.history.nextIndex ?? null;
      state.isLoadingMoreChunks = false;
    },
    privateChatHistoryChunkReceived: (state, { payload }: PayloadAction<PrivateChatHistoryChunk>) => {
      const participantId = payload.correspondent;
      const private_messages = payload.history.messages.filter(
        (msg): msg is ChatMessage & { scope: ChatScope.Private } => msg.scope === ChatScope.Private
      );
      if (!state.scope.private[participantId]) {
        state.scope.private[participantId] = {
          messages: privateMessagesAdapter.getInitialState({}, private_messages),
          nextIndex: payload.history.nextIndex ?? null,
          lastSeenTimestamp: new Date().toISOString() as Timestamp,
        };
      } else {
        privateMessagesAdapter.addMany(state.scope.private[participantId].messages, private_messages);
        state.scope.private[participantId].nextIndex = payload.history.nextIndex ?? null;
      }
      state.isLoadingMoreChunks = false;
    },
    setChatSearchResults: (state, { payload }: PayloadAction<ChatMessage[]>) => {
      state.searchResults = payload;
    },
    lastSeenTimestampAdded: (state: ChatState, { payload }: PayloadAction<LastSeenTimestampAddedPayload>) => {
      const { scope, timestamp } = payload;
      switch (scope) {
        case ChatScope.Global:
          state.scope.global.lastSeenTimestamp = timestamp;
          break;
        case ChatScope.Private: {
          const { target } = payload;
          if (Reflect.has(state.scope.private, target)) {
            state.scope.private[target].lastSeenTimestamp = timestamp;
          } else {
            state.scope.private[target] = {
              messages: privateMessagesAdapter.getInitialState(),
              nextIndex: null,
              lastSeenTimestamp: timestamp,
            };
          }
          break;
        }
        case ChatScope.Breakout: {
          const { target } = payload;
          if (Reflect.has(state.scope.breakout, target)) {
            state.scope.breakout[target].lastSeenTimestamp = timestamp;
          } else {
            state.scope.breakout[target] = {
              messages: breakoutMessagesAdapter.getInitialState(),
              nextIndex: null,
              lastSeenTimestamp: timestamp,
            };
          }
          break;
        }
      }
    },
    setChatSettings: (
      state: ChatState,
      {
        payload: { id, timestamp, enabled },
      }: PayloadAction<{ id: ParticipantId; timestamp: Timestamp; enabled: boolean }>
    ) => {
      state.settings.enabled = enabled;
      state.settings.changedAt = timestamp;
      state.settings.changedBy = id;
    },
    clearGlobalChat: (state: ChatState) => {
      state.scope.global.messages = globalMessagesAdapter.getInitialState();
      state.scope.global.nextIndex = null;
      state.scope.global.lastSeenTimestamp = new Date().toISOString() as Timestamp;
    },
    setIsLoadingMoreChunks: (state: ChatState, action: PayloadAction<boolean>) => {
      state.isLoadingMoreChunks = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(joinSuccess, (state: ChatState, { payload: { chat, breakout } }) => {
      globalMessagesAdapter.setAll(
        state.scope.global.messages,
        chat.globalHistory.messages.filter(
          (msg): msg is ChatMessage & { scope: ChatScope.Global } => msg.scope === ChatScope.Global
        )
      );
      state.scope.global.nextIndex = chat.globalHistory.nextIndex;

      chat.privateHistory.forEach((ph) => {
        state.scope.private[ph.correspondent] = {
          messages: privateMessagesAdapter.setAll(
            privateMessagesAdapter.getInitialState(),
            ph.history.messages.filter(
              (msg): msg is ChatMessage & { scope: ChatScope.Private } => msg.scope === ChatScope.Private
            )
          ),
          nextIndex: ph.history.nextIndex,
          lastSeenTimestamp: new Date().toISOString() as Timestamp,
        };
      });
      const breakoutRoomId = breakout?.room?.id;
      if (chat.breakoutRoomHistory && breakoutRoomId != null) {
        state.scope.breakout[breakoutRoomId] = {
          messages: breakoutMessagesAdapter.setAll(
            breakoutMessagesAdapter.getInitialState(),
            chat.breakoutRoomHistory.messages.filter(
              (msg): msg is ChatMessage & { scope: ChatScope.Breakout } => msg.scope === ChatScope.Breakout
            )
          ),
          nextIndex: chat.breakoutRoomHistory?.nextIndex ?? null,
          lastSeenTimestamp: new Date().toISOString() as Timestamp,
        };
      }
    });
  },
});

export const {
  lastSeenTimestampAdded,
  received,
  roomChatHistoryChunkReceived,
  privateChatHistoryChunkReceived,
  setChatSearchResults,
  setChatSettings,
  clearGlobalChat,
  setIsLoadingMoreChunks,
} = chatSlice.actions;
export const actions = chatSlice.actions;

export const selectLastSeenTimestampGlobal = (state: { chat: ChatState }) => state.chat.scope.global.lastSeenTimestamp;

export const selectChatEnabledState = (state: { chat: ChatState }) => state.chat.settings.enabled;
export const selectIsLoadingMoreChunks = (state: { chat: ChatState }) => state.chat.isLoadingMoreChunks;
export const selectChatSearchResults = (state: { chat: ChatState }) => state.chat.searchResults;
export const selectChatState = (state: { chat: ChatState }) => state.chat;

export const selectHasAnyUnreadPrivateChatMessage = createSelector(
  [(state: { chat: ChatState }) => state.chat.scope.private],
  (privateChats) => {
    if (!privateChats) {
      return false;
    }

    return Object.values(privateChats).some((privateChat) => {
      const lastSeenTimestamp = privateChat.lastSeenTimestamp;
      if (lastSeenTimestamp) {
        const messages = privateMessagesSelectors.selectAll(privateChat.messages);
        const lastMessage = messages.at(-1);
        return lastMessage && isAfter(new Date(lastMessage.timestamp), new Date(lastSeenTimestamp));
      }
      return false;
    });
  }
);

export const selectHasUnreadGlobalChatMessages = (state: { chat: ChatState }) => {
  const messages = globalMessagesSelectors.selectAll(state.chat.scope.global.messages);
  const lastSeenTimestamp = state.chat.scope.global.lastSeenTimestamp;
  const lastMessage = messages.at(-1);
  return (
    messages.length > 0 &&
    lastMessage !== undefined &&
    isAfter(new Date(lastMessage.timestamp), new Date(lastSeenTimestamp))
  );
};

export const selectChatMessagesByScope = (state: { chat: ChatState }, chatIdentifier: ChatIdentifier) => {
  const { scope, target } = chatIdentifier;

  switch (scope) {
    case ChatScope.Global:
      return globalMessagesSelectors.selectAll(state.chat.scope.global.messages);
    case ChatScope.Private: {
      const privateMessages = state.chat.scope.private[target]?.messages;
      return privateMessages ? privateMessagesSelectors.selectAll(privateMessages) : [];
    }
    case ChatScope.Breakout: {
      const breakoutMessages = state.chat.scope.breakout[target]?.messages;
      return breakoutMessages ? breakoutMessagesSelectors.selectAll(breakoutMessages) : [];
    }
    default:
      return [];
  }
};

export const selectAllGlobalChatMessages = createSelector(
  [(state: { chat: ChatState }) => state.chat.scope.global.messages],
  (messages) => globalMessagesSelectors.selectAll(messages)
);

export const selectAllPrivateChatMessages = createSelector(
  [(state: { chat: ChatState }) => state.chat.scope.private],
  (privateChats) => Object.values(privateChats).flatMap((chat) => privateMessagesSelectors.selectAll(chat.messages))
);

export const selectAllChatMessages = createSelector(
  [selectAllGlobalChatMessages, selectAllPrivateChatMessages],
  (globalMessages, privateMessages) => [...globalMessages, ...privateMessages].filter((msg) => msg !== undefined)
);

export const selectAllPrivateChats = createSelector(
  [(state: { chat: ChatState }) => state.chat.scope.private],
  (privateScope) => {
    return Object.entries(privateScope).map(([participantId, chat]) => {
      const messages = privateMessagesSelectors.selectAll(chat.messages);
      return {
        chatIdentifier: {
          scope: ChatScope.Private,
          target: participantId,
        },
        messages,
        lastMessage: messages.at(-1) ?? null,
      } as PrivateChatProps;
    });
  }
);

export const selectLastMessageForScope = createSelector([selectChatMessagesByScope], (messages) => messages.at(-1));

export const selectUnreadGlobalMessageCount = createSelector(
  [
    (state: { chat: ChatState }) => globalMessagesSelectors.selectAll(state.chat.scope.global.messages),
    (state: { chat: ChatState }) => state.chat.scope.global.lastSeenTimestamp,
  ],
  (messages, lastSeenTimestamp) =>
    messages.filter((message) => isAfter(new Date(message.timestamp), new Date(lastSeenTimestamp))).length
);

export const selectNotOwnGlobalChatMessages = createSelector(
  [
    (state: { chat: ChatState }) => globalMessagesSelectors.selectAll(state.chat.scope.global.messages),
    (state: { user: UserState }) => state.user.uuid,
  ],
  (messages, userId) => messages.filter((message) => message.source !== userId)
);

export const selectUnreadPersonalMessageCountByTarget = createSelector(
  [
    (state: { chat: ChatState }, target: ParticipantId) => {
      const privateChat = state.chat.scope.private[target];
      return privateChat ? privateMessagesSelectors.selectAll(privateChat.messages) : undefined;
    },
    (state: { chat: ChatState }, target: ParticipantId) => {
      const privateChat = state.chat.scope.private[target];
      if (privateChat) {
        return privateChat.lastSeenTimestamp;
      }
      return undefined;
    },
  ],
  (privateMessages, lastSeenTimestamp) => {
    const messages = privateMessages ?? [];
    if (!lastSeenTimestamp) {
      return messages.length;
    }
    return messages.filter((message) => new Date(message.timestamp) > new Date(lastSeenTimestamp)).length;
  }
);

export const selectNextIndex = createSelector(
  [
    (state: { chat: ChatState }) => state,
    (_state: { chat: ChatState }, chatIdentifier: ChatIdentifier) => chatIdentifier,
  ],
  (state, chatIdentifier) => {
    const { scope, target } = chatIdentifier;
    switch (scope) {
      case ChatScope.Global:
        return state.chat.scope.global.nextIndex;
      case ChatScope.Private:
        return state.chat.scope.private[target]?.nextIndex;
      case ChatScope.Breakout:
        return state.chat.scope.breakout[target]?.nextIndex;
    }
  }
);

export default chatSlice.reducer;
