// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { EntityState, PayloadAction, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import { isAfter } from 'date-fns';

import { GroupChatHistoryChunk, PrivateChatHistoryChunk, RoomChatHistoryChunk } from '../../api/types/incoming/chat';
import { LastSeenTimestampAddedPayload } from '../../api/types/outgoing/chat';
import { ChatMessage, ChatScope, GroupId, ParticipantId, TargetId, Timestamp } from '../../types';
import { joinSuccess } from '../commonActions';
import { UserState } from './userSlice';

export type ChatProps = {
  id: TargetId;
  messages: Array<ChatMessage>;
  scope: ChatScope;
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

const groupMessagesAdapter = createEntityAdapter<ChatMessage & { scope: ChatScope.Group }, ChatMessage['id']>({
  selectId: (message: ChatMessage) => `${message.source}@${message.timestamp}`,
  sortComparer: (a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp),
});

export const groupMessagesSelectors = groupMessagesAdapter.getSelectors();

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
    group: {
      [id: GroupId]: {
        messages: EntityState<ChatMessage & { scope: ChatScope.Group }, ChatMessage['id']>;
        nextIndex: number | null;
        lastSeenTimestamp: Timestamp;
      };
    };
    private: {
      [id: ParticipantId]: {
        messages: EntityState<ChatMessage & { scope: ChatScope.Private }, ChatMessage['id']>;
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
    group: {},
    private: {},
  },
  isLoadingMoreChunks: false,
  searchResults: [],
};

const getMessageRecipient = (message: ChatMessage, currentUserId: ParticipantId) => {
  if (message.target) {
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

        case ChatScope.Private:
          if (chatMessage.target) {
            const participantId = getMessageRecipient(chatMessage, userId) as ParticipantId;
            if (!Reflect.has(state.scope.private, participantId)) {
              state.scope.private[participantId] = {
                messages: privateMessagesAdapter.getInitialState({}, [chatMessage]),
                nextIndex: null,
                lastSeenTimestamp: new Date(Date.parse(chatMessage.timestamp) - 1).toISOString() as Timestamp,
              };
            } else {
              privateMessagesAdapter.addOne(state.scope.private[participantId].messages, chatMessage);
            }
          }
          break;

        case ChatScope.Group:
          if (chatMessage.target) {
            const groupId = chatMessage.target as GroupId;
            if (!Reflect.has(state.scope.group, groupId)) {
              state.scope.group[groupId] = {
                messages: groupMessagesAdapter.getInitialState({}, [chatMessage]),
                nextIndex: null,
                lastSeenTimestamp: new Date(Date.parse(chatMessage.timestamp) - 1).toISOString() as Timestamp,
              };
            } else {
              groupMessagesAdapter.addOne(state.scope.group[groupId].messages, chatMessage);
            }
          }
          break;
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
    groupChatHistoryChunkReceived: (state, { payload }: PayloadAction<GroupChatHistoryChunk>) => {
      const groupId = payload.id;
      const group_messages = payload.history.messages.filter(
        (msg): msg is ChatMessage & { scope: ChatScope.Group } => msg.scope === ChatScope.Group
      );
      if (!state.scope.group[groupId]) {
        state.scope.group[groupId] = {
          messages: groupMessagesAdapter.getInitialState({}, group_messages),
          nextIndex: payload.history.nextIndex ?? null,
          lastSeenTimestamp: new Date().toISOString() as Timestamp,
        };
      } else {
        groupMessagesAdapter.addMany(state.scope.group[groupId].messages, group_messages);
        state.scope.group[groupId].nextIndex = payload.history.nextIndex ?? null;
      }
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
    lastSeenTimestampAdded: (
      state: ChatState,
      { payload: { scope, target, timestamp } }: PayloadAction<LastSeenTimestampAddedPayload>
    ) => {
      if (scope === ChatScope.Global) {
        state.scope.global.lastSeenTimestamp = timestamp;
      }
      if (scope === ChatScope.Private && target) {
        if (Reflect.has(state.scope.private, target)) {
          state.scope.private[target].lastSeenTimestamp = timestamp;
        }
      }
      if (scope === ChatScope.Group && target) {
        if (Reflect.has(state.scope.group, target)) {
          state.scope.group[target].lastSeenTimestamp = timestamp;
        }
      }
    },
    setGlobalChatLastSeenTimestamp: (state: ChatState, { payload: { value } }: PayloadAction<{ value: Timestamp }>) => {
      state.scope.global.lastSeenTimestamp = value;
    },
    setLastSeenTimestampForPrivateChat: (
      state: ChatState,
      { payload: { participantId, timestamp } }: PayloadAction<{ participantId: ParticipantId; timestamp: Timestamp }>
    ) => {
      if (Reflect.has(state.scope.private, participantId)) {
        state.scope.private[participantId].lastSeenTimestamp = timestamp;
      } else {
        state.scope.private[participantId] = {
          messages: privateMessagesAdapter.getInitialState(),
          nextIndex: null,
          lastSeenTimestamp: timestamp,
        };
      }
    },
    setLastSeenTimestampForGroupChat: (
      state: ChatState,
      { payload: { groupId, timestamp } }: PayloadAction<{ groupId: GroupId; timestamp: Timestamp }>
    ) => {
      if (Reflect.has(state.scope.group, groupId)) {
        state.scope.group[groupId].lastSeenTimestamp = timestamp;
      } else {
        state.scope.group[groupId] = {
          messages: groupMessagesAdapter.getInitialState(),
          nextIndex: null,
          lastSeenTimestamp: timestamp,
        };
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
    builder.addCase(joinSuccess, (state: ChatState, { payload: { chat } }) => {
      globalMessagesAdapter.setAll(
        state.scope.global.messages,
        chat.roomHistory.messages.filter(
          (msg): msg is ChatMessage & { scope: ChatScope.Global } => msg.scope === ChatScope.Global
        )
      );
      state.scope.global.nextIndex = chat.roomHistory.nextIndex;

      const privateMessagesByParticipant: Record<ParticipantId, ChatMessage[]> = {};
      for (const message of chat.roomHistory.messages) {
        if (message.scope === ChatScope.Private && message.target) {
          const participantId = message.target;
          if (!privateMessagesByParticipant[participantId]) {
            privateMessagesByParticipant[participantId] = [];
          }
          privateMessagesByParticipant[participantId].push(message);
        }
      }
      for (const [participantId, messages] of Object.entries(privateMessagesByParticipant)) {
        state.scope.private[participantId as ParticipantId] = {
          messages: privateMessagesAdapter.setAll(
            privateMessagesAdapter.getInitialState(),
            messages.filter((msg): msg is ChatMessage & { scope: ChatScope.Private } => msg.scope === ChatScope.Private)
          ),
          nextIndex: null,
          lastSeenTimestamp: new Date().toISOString() as Timestamp,
        };
      }

      chat.groupsHistory
        .filter((group) => group.history.messages.length > 0)
        .forEach((group) => {
          state.scope.group[group.name] = {
            messages: groupMessagesAdapter.setAll(
              groupMessagesAdapter.getInitialState(),
              group.history.messages.filter(
                (msg): msg is ChatMessage & { scope: ChatScope.Group } => msg.scope === ChatScope.Group
              )
            ),
            nextIndex: group.history.nextIndex,
            lastSeenTimestamp: new Date().toISOString() as Timestamp,
          };
        });
    });
  },
});

export const {
  lastSeenTimestampAdded,
  received,
  roomChatHistoryChunkReceived,
  groupChatHistoryChunkReceived,
  privateChatHistoryChunkReceived,
  setChatSearchResults,
  setGlobalChatLastSeenTimestamp,
  setLastSeenTimestampForPrivateChat,
  setLastSeenTimestampForGroupChat,
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
export const selectHasAnyUnreadGroupChatMessage = createSelector(
  [(state: { chat: ChatState }) => state.chat.scope.group],
  (groups) => {
    if (!groups) {
      return false;
    }

    return Object.values(groups).some((group) => {
      const messages = groupMessagesSelectors.selectAll(group.messages);
      const lastMessage = messages.at(-1);
      return lastMessage && new Date(lastMessage.timestamp) > new Date(group.lastSeenTimestamp);
    });
  }
);

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

export const selectAllGlobalChatMessages = createSelector(
  [(state: { chat: ChatState }) => state.chat.scope.global.messages],
  (messages) => globalMessagesSelectors.selectAll(messages)
);

export const selectAllPrivateChatMessages = createSelector(
  [(state: { chat: ChatState }) => state.chat.scope.private],
  (privateChats) => Object.values(privateChats).flatMap((chat) => privateMessagesSelectors.selectAll(chat.messages))
);

export const selectAllGroupChatMessages = createSelector(
  [(state: { chat: ChatState }) => state.chat.scope.group],
  (groupChats) => Object.values(groupChats).flatMap((chat) => groupMessagesSelectors.selectAll(chat.messages))
);

export const selectAllChatMessages = createSelector(
  [selectAllGlobalChatMessages, selectAllPrivateChatMessages, selectAllGroupChatMessages],
  (globalMessages, privateMessages, groupMessages) =>
    [...globalMessages, ...privateMessages, ...groupMessages].filter((msg) => msg !== undefined)
);

export const selectAllPrivateChats = createSelector(
  [(state: { chat: ChatState }) => state.chat.scope.private],
  (privateScope) => {
    return Object.entries(privateScope).map(([participantId, chat]) => {
      const messages = privateMessagesSelectors.selectAll(chat.messages);
      return {
        id: participantId,
        scope: ChatScope.Private,
        messages,
        lastMessage: messages.at(-1) ?? null,
      } as ChatProps;
    });
  }
);

// Select all group chats (not just messages)
export const selectAllGroupChats = createSelector(
  [(state: { chat: ChatState }) => state.chat.scope.group],
  (groupScope) =>
    Object.entries(groupScope).map(([groupId, chat]) => {
      const messages = groupMessagesSelectors.selectAll(chat.messages);
      return {
        id: groupId,
        scope: ChatScope.Group,
        messages,
        lastMessage: messages.at(-1) ?? null,
      } as ChatProps;
    })
);

export function selectLastMessageForScope(
  state: { chat: ChatState },
  scope: ChatScope,
  target?: TargetId
): ChatMessage | undefined {
  if (scope === ChatScope.Global) {
    const messages = globalMessagesSelectors.selectAll(state.chat.scope.global.messages);
    return messages.at(-1);
  }
  if (scope === ChatScope.Private && target) {
    const privateChat = state.chat.scope.private[target as ParticipantId];
    if (privateChat) {
      const messages = privateMessagesSelectors.selectAll(privateChat.messages);
      return messages.at(-1);
    }
  }
  if (scope === ChatScope.Group && target) {
    const groupChat = state.chat.scope.group[target as GroupId];
    if (groupChat) {
      const messages = groupMessagesSelectors.selectAll(groupChat.messages);
      return messages.at(-1);
    }
  }
  return undefined;
}

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
    (state: { chat: ChatState }, targetId: TargetId) => {
      const privateChat = state.chat.scope.private[targetId as ParticipantId];
      return privateChat ? privateMessagesSelectors.selectAll(privateChat.messages) : undefined;
    },
    (state: { chat: ChatState }, targetId: TargetId) => {
      const groupChat = state.chat.scope.group[targetId as GroupId];
      return groupChat ? groupMessagesSelectors.selectAll(groupChat.messages) : undefined;
    },
    (state: { chat: ChatState }, targetId: TargetId) => {
      const privateChat = state.chat.scope.private[targetId as ParticipantId];
      if (privateChat) {
        return privateChat.lastSeenTimestamp;
      }
      const groupChat = state.chat.scope.group[targetId as GroupId];
      if (groupChat) {
        return groupChat.lastSeenTimestamp;
      }
      return undefined;
    },
  ],
  (privateMessages, groupMessages, lastSeenTimestamp) => {
    const messages = privateMessages ?? groupMessages ?? [];
    if (!lastSeenTimestamp) {
      return messages.length;
    }
    return messages.filter((message) => new Date(message.timestamp) > new Date(lastSeenTimestamp)).length;
  }
);

export default chatSlice.reducer;
