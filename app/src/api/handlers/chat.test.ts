// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { notifications } from '../../commonComponents';
import { MenuTab } from '../../components/MenuTabs/fragments/constants';
import type { AppDispatch, RootState } from '../../store';
import {
  clearGlobalChat,
  received,
  setChatSearchResults,
  setChatSettings,
  setGlobalChatLastSeenTimestamp,
} from '../../store/slices/chatSlice';
import type { GroupId, ParticipantId, Timestamp } from '../../types';
import { ChatScope } from '../../types';
import type { ChatMessage } from '../types/incoming/chat';
import { handleChatMessage } from './chat';

vi.mock('i18next', () => ({
  default: {
    t: (key: string) => key,
  },
}));

vi.mock('../../commonComponents', () => ({
  notifications: {
    info: vi.fn(),
  },
}));

const createState = (overrides: Partial<RootState> = {}) =>
  ({
    user: {
      uuid: 'user-1',
    },
    ui: {
      currentMenuTab: MenuTab.Chat,
    },
    ...overrides,
  }) as RootState;

describe('handleChatMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles chat enabled events', () => {
    const dispatch = vi.fn();
    const state = createState();
    const timestamp = '2024-01-01T12:00:00Z' as Timestamp;
    const message: ChatMessage = {
      message: 'chat_enabled',
      id: 'user-1' as ParticipantId,
    };

    handleChatMessage(dispatch as unknown as AppDispatch, message, timestamp, state);

    expect(notifications.info).toHaveBeenCalledExactlyOnceWith('chat-enabled-message');
    expect(dispatch).toHaveBeenCalledWith(setChatSettings({ id: message.id, timestamp, enabled: true }));
  });

  it('notifies on new group messages and updates last seen when chat tab is active', () => {
    const dispatch = vi.fn();
    const state = createState();
    const timestamp = '2024-01-01T12:00:00Z' as Timestamp;
    const message: ChatMessage = {
      message: 'message_sent',
      id: 'message-1',
      source: 'user-2' as ParticipantId,
      content: 'Hello',
      scope: ChatScope.Group,
      target: 'group-1' as GroupId,
    };

    handleChatMessage(dispatch as unknown as AppDispatch, message, timestamp, state);

    expect(notifications.info).toHaveBeenCalledExactlyOnceWith('chat-new-group-message');
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: received.type,
        payload: expect.objectContaining({
          userId: 'user-1',
          chatMessage: expect.objectContaining({
            scope: ChatScope.Group,
            target: message.target,
            timestamp,
          }),
        }),
      })
    );
    expect(dispatch).toHaveBeenCalledWith(setGlobalChatLastSeenTimestamp({ value: timestamp }));
  });

  it('notifies on private messages to the current user', () => {
    const dispatch = vi.fn();
    const state = createState({ ui: { currentMenuTab: MenuTab.People } } as RootState);
    const timestamp = '2024-01-01T12:00:00Z' as Timestamp;
    const message: ChatMessage = {
      message: 'message_sent',
      id: 'message-2',
      source: 'user-2' as ParticipantId,
      content: 'Private',
      scope: ChatScope.Private,
      target: 'user-1' as ParticipantId,
    };

    handleChatMessage(dispatch as unknown as AppDispatch, message, timestamp, state);

    expect(notifications.info).toHaveBeenCalledExactlyOnceWith('chat-new-private-message');

    const getCallType = (call: Array<{ type?: string }>) => call[0].type;
    expect(dispatch.mock.calls.some((call) => getCallType(call) === setGlobalChatLastSeenTimestamp.type)).toBe(false);
  });

  it('clears chat history and notifies', () => {
    const dispatch = vi.fn();
    const state = createState();
    const timestamp = '2024-01-01T12:00:00Z' as Timestamp;
    const message: ChatMessage = {
      message: 'history_cleared',
    };

    handleChatMessage(dispatch as unknown as AppDispatch, message, timestamp, state);

    expect(dispatch).toHaveBeenCalledWith(clearGlobalChat());
    expect(notifications.info).toHaveBeenCalledExactlyOnceWith('chat-delete-global-messages-success');
  });

  it('updates search results', () => {
    const dispatch = vi.fn();
    const state = createState();
    const timestamp = '2024-01-01T12:00:00Z' as Timestamp;
    const message: ChatMessage = {
      message: 'search_results',
      scope: ChatScope.Global,
      matches: {
        messages: [],
        nextIndex: null,
      },
    };

    handleChatMessage(dispatch as unknown as AppDispatch, message, timestamp, state);

    expect(dispatch).toHaveBeenCalledWith(setChatSearchResults([]));
  });
});
