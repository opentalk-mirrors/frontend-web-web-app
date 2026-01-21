// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import i18next from 'i18next';

import { notifications } from '../../commonComponents';
import { MenuTab } from '../../components/MenuTabs/fragments/constants';
import log from '../../logger';
import type { AppDispatch, RootState } from '../../store';
import {
  clearGlobalChat,
  groupChatHistoryChunkReceived,
  privateChatHistoryChunkReceived,
  received,
  roomChatHistoryChunkReceived,
  setChatSearchResults,
  setChatSettings,
  setGlobalChatLastSeenTimestamp,
} from '../../store/slices/chatSlice';
import type { BreakoutRoomId, ChatMessage, GroupId, ParticipantId, Timestamp } from '../../types';
import { ChatScope } from '../../types';
import { chat } from '../types/incoming';

/**
 * Handles chat namespace messages.
 */
export const handleChatMessage = (
  dispatch: AppDispatch,
  data: chat.ChatMessage,
  timestamp: Timestamp,
  state: RootState
) => {
  switch (data.message) {
    case 'chat_enabled':
    case 'chat_disabled': {
      const enabled = data.message === 'chat_enabled';
      notifications.info(i18next.t(`chat-${enabled ? 'enabled' : 'disabled'}-message`));
      dispatch(setChatSettings({ id: data.issuedBy, timestamp, enabled }));
      break;
    }
    case 'message_sent': {
      const userId = state.user.uuid as ParticipantId;
      let chatMessage: ChatMessage;

      const { scope, target } = data;
      const baseMessage = {
        ...data,
        timestamp,
      };

      if (scope === ChatScope.Group) {
        chatMessage = {
          ...baseMessage,
          scope,
          target: target as GroupId,
        };
        if (data.source !== userId) {
          notifications.info(i18next.t('chat-new-group-message'));
        }
      } else if (scope === ChatScope.Private) {
        chatMessage = {
          ...baseMessage,
          scope,
          target: target as ParticipantId,
        };
        if (target === userId) {
          notifications.info(i18next.t('chat-new-private-message'));
        }
      } else if (scope === ChatScope.Breakout) {
        chatMessage = {
          ...baseMessage,
          scope,
          target: target as BreakoutRoomId,
        };
      } else {
        chatMessage = {
          ...baseMessage,
          scope,
          target: undefined,
        };
      }

      dispatch(received({ chatMessage, userId }));
      if (state.ui.currentMenuTab === MenuTab.Chat) {
        dispatch(setGlobalChatLastSeenTimestamp({ value: timestamp }));
      }
      break;
    }
    case 'history_cleared':
      dispatch(clearGlobalChat());
      notifications.info(i18next.t('chat-delete-global-messages-success'));
      break;
    case 'room_chat_history_chunk':
      dispatch(roomChatHistoryChunkReceived(data));
      break;
    case 'group_chat_history_chunk':
      dispatch(groupChatHistoryChunkReceived(data));
      break;
    case 'private_chat_history_chunk':
      dispatch(privateChatHistoryChunkReceived(data));
      break;
    case 'search_results':
      dispatch(setChatSearchResults(data.matches.messages));
      break;
    case 'set_last_seen_timestamp':
      log.warn('TODO: handle set_last_seen_timestamp');
      //TODO - #3062 implement set_last_seen_timestamp handling
      log.warn('handle set_last_seen_timestamp is not implemented');
      break;
    default: {
      const dataString = JSON.stringify(data, null, 2);
      log.error(`Unknown chat message type: ${dataString}`);
      throw new Error(`Unknown message type: ${dataString}`);
    }
  }
};
