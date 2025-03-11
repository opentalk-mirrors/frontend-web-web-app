// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { createEntityAdapter, createSelector, createSlice, EntityState, PayloadAction } from '@reduxjs/toolkit';
import { isAfter } from 'date-fns';
import { last } from 'lodash';

import { RootState } from '../';
import { LastSeenTimestampAddedPayload } from '../../api/types/outgoing/chat';
import { ChatMessage, ChatScope, ParticipantId, TargetId, Timestamp } from '../../types';
import { joinSuccess } from '../commonActions';

const getTargetId = (chatMessage: ChatMessage) => chatMessage.group || chatMessage.target || chatMessage.source;

export const reduceMessagesToPersonalChats = (chatMessages: Array<ChatMessage>) =>
  chatMessages.reduce<Array<ChatProps>>((acc, currentValue) => {
    const index = acc.findIndex((value) => value.id === getTargetId(currentValue));
    if (index !== -1) {
      acc[index].messages.push(currentValue);
      acc[index].lastMessage = currentValue;
    } else {
      acc.push({
        id: getTargetId(currentValue),
        lastMessage: currentValue,
        scope: currentValue.scope,
        messages: [currentValue],
      });
    }
    return acc;
  }, []);

const getUnreadPersonalMessageCount = (messages: ChatMessage[], lastSeenTimestampList: PersonalChatLastSeen[]) => {
  const unreadMessages = messages.filter((message) => {
    const personalChatForTarget = lastSeenTimestampList.find((personalChat) => personalChat.target === message.target);

    if (personalChatForTarget) {
      const lastReadTime = new Date(personalChatForTarget.lastSeenTimestamp);
      const isMessageBeforeLastSeen = isAfter(new Date(message.timestamp), lastReadTime);
      if (isMessageBeforeLastSeen) {
        return message;
      } else {
        return;
      }
    }
    return message;
  });

  return unreadMessages.length;
};

export type ChatProps = {
  id: TargetId;
  messages: Array<ChatMessage>;
  scope: ChatScope;
  lastMessage: ChatMessage;
};

const messagesAdapter = createEntityAdapter<ChatMessage, string>({
  selectId: (message) => `${message.source}@${message.timestamp}`,
  sortComparer: (a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp),
});

export interface PersonalChatLastSeen {
  target: TargetId;
  lastSeenTimestamp: string;
}

const lastSeenTimestampAdapter = createEntityAdapter<PersonalChatLastSeen, TargetId>({
  selectId: (entity) => entity.target,
  sortComparer: (a, b) => a.target.localeCompare(b.target),
});

export interface ChatState {
  enabled: boolean;
  settingsChangedAt?: string;
  settingsChangedBy?: ParticipantId;
  messages: EntityState<ChatMessage, string>;
  lastSeenTimestampGlobal?: string;
  lastSeenTimestampsPersonal: EntityState<PersonalChatLastSeen, TargetId>;
}

const initialState: ChatState = {
  enabled: true,
  messages: messagesAdapter.getInitialState(),
  lastSeenTimestampsPersonal: lastSeenTimestampAdapter.getInitialState(),
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    received: (state, { payload }: PayloadAction<ChatMessage>) => {
      messagesAdapter.addOne(state.messages, payload);
    },
    lastSeenTimestampAdded: (
      state,
      { payload: { scope, target, timestamp } }: PayloadAction<LastSeenTimestampAddedPayload>
    ) => {
      if (scope === ChatScope.Global) {
        state.lastSeenTimestampGlobal = timestamp;
      }
      if ((scope === ChatScope.Group || scope === ChatScope.Private) && target) {
        lastSeenTimestampAdapter.setOne(state.lastSeenTimestampsPersonal, {
          target,
          lastSeenTimestamp: timestamp,
        });
      }
    },
    setChatSettings: (
      state,
      {
        payload: { id, timestamp, enabled },
      }: PayloadAction<{ id: ParticipantId; timestamp: Timestamp; enabled: boolean }>
    ) => {
      state.enabled = enabled;
      state.settingsChangedAt = new Date(timestamp).toISOString();
      state.settingsChangedBy = id;
    },
    clearGlobalChat: (state) => {
      const keys = Object.keys(state.messages.entities);
      for (const key of keys) {
        const entity = state.messages.entities[key];
        if (entity?.scope === ChatScope.Global) {
          delete state.messages.entities[key];
        }
      }
      state.messages.ids = Object.keys(state.messages.entities);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(joinSuccess, (state, { payload: { chat } }) => {
      messagesAdapter.setAll(state.messages, chat.roomHistory);
      state.enabled = chat.enabled;
      state.lastSeenTimestampGlobal = chat.lastSeenTimestampGlobal;

      if (chat.lastSeenTimestampsGroup) {
        const values = Object.values(chat.lastSeenTimestampsGroup);
        const result: PersonalChatLastSeen[] = Object.keys(chat.lastSeenTimestampsGroup).map((key, index) => {
          return { target: key, lastSeenTimestamp: values[index] } as PersonalChatLastSeen;
        });
        lastSeenTimestampAdapter.addMany(state.lastSeenTimestampsPersonal, result);
      }

      if (chat.lastSeenTimestampsPrivate) {
        const values = Object.values(chat.lastSeenTimestampsPrivate);
        const result: PersonalChatLastSeen[] = Object.keys(chat.lastSeenTimestampsPrivate).map((key, index) => {
          return { target: key, lastSeenTimestamp: values[index] } as PersonalChatLastSeen;
        });
        lastSeenTimestampAdapter.addMany(state.lastSeenTimestampsPersonal, result);
      }
    });
  },
});

export const { lastSeenTimestampAdded, received, setChatSettings, clearGlobalChat } = chatSlice.actions;
export const actions = chatSlice.actions;

export const selectLastSeenTimestampGlobal = (state: RootState) => state.chat.lastSeenTimestampGlobal;
export const selectLastSeenTimestamps = (state: RootState) =>
  lastSeenTimestampAdapter.getSelectors<RootState>((state) => state.chat.lastSeenTimestampsPersonal).selectAll(state);

export const selectChatEnabledState = (state: RootState) => state.chat.enabled;
const chatMessagesSelectors = messagesAdapter.getSelectors<RootState>((state) => state.chat.messages);

// For some reason in unit tests selectAll method returned array with undefined messages inside
// therefore we filter them out, as it doesn't hurt in production as well
export const selectAllChatMessages = (state: RootState) =>
  chatMessagesSelectors.selectAll(state).filter((message) => message !== undefined);

export const selectChatMessagesById = (id: string) => (state: RootState) => chatMessagesSelectors.selectById(state, id);

export const selectChatMessagesByScope = (scope: ChatScope, targetId?: TargetId) => {
  const isInTargetScope = (chatMessage: ChatMessage) =>
    scope === ChatScope.Global
      ? chatMessage.scope === scope
      : chatMessage.scope === scope &&
        (chatMessage.group === targetId || chatMessage.target === targetId || chatMessage.source === targetId);

  return createSelector(selectAllChatMessages, (messages) => messages.filter(isInTargetScope));
};

export const selectAllGlobalChatMessages = createSelector(selectAllChatMessages, (chatMessages) =>
  chatMessages.filter((chatMessage) => chatMessage.scope === ChatScope.Global)
);
export const selectAllGroupChatMessages = createSelector(selectAllChatMessages, (chatMessages) =>
  chatMessages.filter((chatMessage) => chatMessage.scope === ChatScope.Group)
);
export const selectAllPrivateChatMessages = createSelector(selectAllChatMessages, (chatMessages) =>
  chatMessages.filter((chatMessage) => chatMessage.scope === ChatScope.Private)
);
export const selectAllGroupChats = createSelector(selectAllGroupChatMessages, (chatMessages) =>
  reduceMessagesToPersonalChats(chatMessages)
);
export const selectLastMessageForScope = (scope: ChatScope, target?: TargetId) =>
  createSelector(selectChatMessagesByScope(scope, target), (messages) => last(messages));

export const selectUnreadGlobalMessageCount = createSelector(
  selectAllGlobalChatMessages,
  selectLastSeenTimestampGlobal,
  (globalMessages, lastSeenTimestampGlobal) => {
    if (lastSeenTimestampGlobal && globalMessages.length > 0) {
      return globalMessages.filter((message) => isAfter(new Date(message.timestamp), new Date(lastSeenTimestampGlobal)))
        .length;
    }

    return globalMessages.length;
  }
);

export const selectUnreadPersonalMessageCount = createSelector(
  selectAllGroupChatMessages,
  selectAllPrivateChatMessages,
  selectLastSeenTimestamps,
  (groupMessages, privateMessages, lastSeenTimestamps) => {
    if (lastSeenTimestamps.length > 0 && (groupMessages.length > 0 || privateMessages.length > 0)) {
      const unreadGroupMessageCount = getUnreadPersonalMessageCount(groupMessages, lastSeenTimestamps);
      const unreadPrivateMessageCount = getUnreadPersonalMessageCount(privateMessages, lastSeenTimestamps);

      return unreadGroupMessageCount + unreadPrivateMessageCount;
    }

    return groupMessages.length + privateMessages.length;
  }
);

export const selectUnreadPersonalMessageCountByTarget = (targetId: TargetId) =>
  createSelector(selectAllChatMessages, selectLastSeenTimestamps, (allChatMessages, lastSeenTimestamps) => {
    const messagesForTargetId = allChatMessages.filter(
      (message) =>
        (message.scope === ChatScope.Group || message.scope === ChatScope.Private) && message.target === targetId
    );

    const lastSeenStates = lastSeenTimestamps.filter((lastSeenState) => lastSeenState.target === targetId);
    if (lastSeenStates.length > 0) {
      const maxLastSeenTimestamp = Math.max(
        ...lastSeenStates.map((lastSeenState) => new Date(lastSeenState.lastSeenTimestamp).getTime())
      );
      const maxLastSeenChatMessageTimestamp = Math.max(
        ...messagesForTargetId.map((message) => new Date(message.timestamp).getTime())
      );
      if (maxLastSeenChatMessageTimestamp <= maxLastSeenTimestamp) {
        return 0;
      }
    }
    return messagesForTargetId.length;
  });

export default chatSlice.reducer;
