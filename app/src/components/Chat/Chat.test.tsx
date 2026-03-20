// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { setLastSeenTimestamp } from '../../api/types/outgoing/chat';
import { lastSeenTimestampAdded, received } from '../../store/slices/chatSlice';
import { setChatSearchValue } from '../../store/slices/uiSlice';
import { ChatMessage, ChatScope, GroupId, ParticipantId, Timestamp } from '../../types';
import { configureStore, renderWithProviders } from '../../utils/testUtils';
import Chat from './Chat';

const chatListPropsSpy = vi.fn();

vi.mock('../../modules/WebRTC/ConferenceRoom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../modules/WebRTC/ConferenceRoom')>()),
  getCurrentConferenceRoom: () => ({
    sendMessage: vi.fn(),
  }),
}));

vi.mock('./fragments/ChatSearch', async () => {
  const { forwardRef } = await import('react');
  const ChatSearchMock = forwardRef<HTMLInputElement, { value: string; onChange(nextValue: string): void }>(
    ({ value, onChange }, ref) => (
      <input data-testid="chat-search" ref={ref} value={value} onChange={(event) => onChange(event.target.value)} />
    )
  );
  ChatSearchMock.displayName = 'ChatSearchMock';

  return {
    __esModule: true,
    default: ChatSearchMock,
  };
});

vi.mock('./fragments/ChatList', () => {
  const ChatListMock = ({
    onReset,
    scope,
    targetId,
  }: {
    onReset?: () => void;
    scope?: ChatScope;
    targetId?: string;
  }) => {
    chatListPropsSpy({ onReset, scope, targetId });
    return (
      <div data-testid="chat-list">
        {onReset && (
          <button type="button" data-testid="chat-list-reset" onClick={onReset}>
            reset
          </button>
        )}
      </div>
    );
  };
  ChatListMock.displayName = 'ChatListMock';

  return {
    __esModule: true,
    default: ChatListMock,
  };
});

vi.mock('./fragments/ChatForm', () => ({
  __esModule: true,
  default: () => <div data-testid="chat-form" />,
}));

vi.mock('./fragments/ChatLiveRegion', () => ({
  __esModule: true,
  default: () => <div data-testid="chat-live-region" />,
}));

function createChatMessage(scope?: ChatScope.Global): ChatMessage;
function createChatMessage(scope: ChatScope.Private, target: ParticipantId): ChatMessage;
function createChatMessage(scope: ChatScope = ChatScope.Global, target?: ParticipantId | GroupId): ChatMessage {
  const baseMessage = {
    id: 'chat-message-id',
    timestamp: '2024-05-05T10:00:00.000Z' as Timestamp,
    source: 'participant-1' as ParticipantId,
    content: 'Hello world',
  };

  if (scope === ChatScope.Private && target) {
    return { ...baseMessage, scope, target: target as ParticipantId };
  }

  if (scope === ChatScope.Group && target) {
    return { ...baseMessage, scope, target: target as GroupId };
  }

  return { ...baseMessage, scope: ChatScope.Global };
}

describe('Chat', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    chatListPropsSpy.mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('dispatches last seen updates for global messages', async () => {
    const { store, dispatchSpy } = configureStore();
    const lastMessage = createChatMessage();
    const timestamp = lastMessage.timestamp as Timestamp;

    store.dispatch(received({ chatMessage: lastMessage, userId: lastMessage.source }));
    dispatchSpy.mockClear();

    renderWithProviders(<Chat />, { store });

    expect(dispatchSpy).toHaveBeenCalledExactlyOnceWith(lastSeenTimestampAdded({ scope: ChatScope.Global, timestamp }));

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(dispatchSpy).toHaveBeenCalledTimes(2);
    expect(dispatchSpy).toHaveBeenLastCalledWith(setLastSeenTimestamp.action({ scope: ChatScope.Global, timestamp }));
  });

  it('dispatches last seen updates for private messages with target', () => {
    const targetId = 'participant-2' as ParticipantId;
    const { store, dispatchSpy } = configureStore({
      initialState: {
        ui: {
          chatConversationState: {
            scope: ChatScope.Private,
            targetId,
          },
          chatAutosavedInputs: {
            [ChatScope.Private]: {
              [targetId]: '',
            },
          },
        },
      },
    });
    const lastMessage = createChatMessage(ChatScope.Private, targetId);
    const timestamp = lastMessage.timestamp as Timestamp;

    store.dispatch(received({ chatMessage: lastMessage, userId: lastMessage.source }));
    dispatchSpy.mockClear();

    renderWithProviders(<Chat />, { store });

    expect(dispatchSpy).toHaveBeenCalledExactlyOnceWith(
      lastSeenTimestampAdded({ scope: ChatScope.Private, target: targetId, timestamp })
    );

    dispatchSpy.mockClear();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(dispatchSpy).toHaveBeenCalledExactlyOnceWith(
      setLastSeenTimestamp.action({ scope: ChatScope.Private, target: targetId, timestamp })
    );
  });

  it('updates search value and dispatches it after debounce', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    const { store, dispatchSpy } = configureStore();
    store.dispatch(setChatSearchValue('prefilled'));
    dispatchSpy.mockClear();

    renderWithProviders(<Chat />, { store });

    const searchInput = screen.getByTestId('chat-search') as HTMLInputElement;
    expect(searchInput.value).toBe('prefilled');

    await user.clear(searchInput);
    await user.type(searchInput, 'new query');
    expect(searchInput.value).toBe('new query');

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith(setChatSearchValue('new query'));
    });
  });

  it('resets search value and focuses search input when chat list requests reset', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    const { store, dispatchSpy } = configureStore();
    store.dispatch(setChatSearchValue('keep-me'));
    dispatchSpy.mockClear();

    renderWithProviders(<Chat />, { store });

    const searchInput = screen.getByTestId('chat-search') as HTMLInputElement;
    expect(searchInput.value).toBe('keep-me');

    const resetButton = screen.getByTestId('chat-list-reset');
    await user.click(resetButton);

    expect(searchInput.value).toBe('');
    expect(dispatchSpy).toHaveBeenCalledWith(setChatSearchValue(''));
    expect(searchInput).toHaveFocus();
  });

  it('renders the live region only for the global scope', () => {
    const storeWithGlobalScope = configureStore({
      initialState: {
        ui: {
          chatConversationState: {
            scope: ChatScope.Global,
          },
        },
      },
    });
    const { unmount } = renderWithProviders(<Chat />, { store: storeWithGlobalScope.store });

    expect(screen.getByTestId('chat-live-region')).toBeInTheDocument();

    unmount();
    const storeWithPrivateScope = configureStore({
      initialState: {
        ui: {
          chatConversationState: {
            scope: ChatScope.Private,
            targetId: 'participant-2' as ParticipantId,
          },
        },
      },
    });
    renderWithProviders(<Chat />, { store: storeWithPrivateScope.store });

    expect(screen.queryByTestId('chat-live-region')).not.toBeInTheDocument();
  });
});
