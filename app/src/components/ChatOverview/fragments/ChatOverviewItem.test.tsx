// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import * as Hooks from '../../../hooks';
import { PrivateChatProps, received } from '../../../store/slices/chatSlice';
import { ChatMessage, ChatScope, ParticipantId } from '../../../types';
import { configureStore, mockedParticipant, renderWithProviders } from '../../../utils/testUtils';
import ChatOverviewItem from './ChatOverviewItem';

const participant = mockedParticipant(0);
const {
  getTrackPublication: _getTrackPublication,
  setMicrophoneEnabled: _setMicrophoneEnabled,
  videoTrackPublications: _videoTrackPublications,
  ...participantState
} = participant;
const currentUserId = 'current-user' as ParticipantId;

const createChat = (overrides?: Partial<PrivateChatProps>): PrivateChatProps => {
  const lastMessage: ChatMessage =
    overrides?.lastMessage ??
    ({
      id: 'message-1',
      scope: ChatScope.Private,
      source: participant.id,
      target: currentUserId,
      timestamp: '2024-02-01T10:00:00Z',
      content: 'Hello world',
    } as ChatMessage);

  const messages = overrides?.messages ?? [lastMessage];

  return {
    chatIdentifier: {
      scope: ChatScope.Private,
      target: overrides?.chatIdentifier?.target ?? participant.id,
    },
    lastMessage,
    messages,
  };
};

describe('ChatOverviewItem', () => {
  beforeEach(() => {
    vi.spyOn(Hooks, 'useDateFormat').mockReturnValue('10:00');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders participant name, formatted time and last message', () => {
    const { store } = configureStore({
      initialState: {
        participants: {
          ids: [participant.id],
          entities: { [participant.id]: participantState },
        },
      },
    });

    const chat = createChat();

    renderWithProviders(<ChatOverviewItem chat={chat} onClick={vi.fn()} />, {
      store,
      provider: { mui: true },
    });

    expect(screen.getByText(participant.displayName)).toBeInTheDocument();
    expect(screen.getByText('10:00')).toBeInTheDocument();
    expect(screen.getByText(chat.lastMessage.content)).toBeInTheDocument();
  });

  it('falls back to chat id when participant is missing', () => {
    const chatId = 'ghost-participant' as ParticipantId;
    const { store } = configureStore({
      initialState: {
        participants: {
          ids: [],
          entities: {},
        },
      },
    });

    const chat = createChat({ chatIdentifier: { scope: ChatScope.Private, target: chatId } });

    renderWithProviders(<ChatOverviewItem chat={chat} onClick={vi.fn()} />, {
      store,
      provider: { mui: true },
    });

    expect(screen.getByText(chatId)).toBeInTheDocument();
  });

  it('highlights unread personal messages by using bold font weight', async () => {
    const { store } = configureStore({
      initialState: {
        participants: {
          ids: [participant.id],
          entities: { [participant.id]: participantState },
        },
      },
    });

    const unreadMessage: ChatMessage = {
      id: 'message-unread',
      scope: ChatScope.Private,
      source: participant.id,
      target: currentUserId,
      timestamp: '2024-02-01T10:00:00Z',
      content: 'Unread message',
    };

    store.dispatch(received({ chatMessage: unreadMessage, userId: currentUserId }));

    const chat: PrivateChatProps = {
      chatIdentifier: {
        scope: ChatScope.Private,
        target: participant.id,
      },
      lastMessage: unreadMessage,
      messages: [unreadMessage],
    };

    renderWithProviders(<ChatOverviewItem chat={chat} onClick={vi.fn()} />, {
      store,
      provider: { mui: true },
    });

    const displayName = await screen.findByText(participant.displayName);

    await waitFor(() => expect(displayName).toHaveStyle('font-weight: 700'));
  });

  it('calls onClick with chat id', async () => {
    const user = userEvent.setup();
    const { store } = configureStore({
      initialState: {
        participants: {
          ids: [participant.id],
          entities: { [participant.id]: participantState },
        },
      },
    });

    const chat = createChat();
    const handleClick = vi.fn();

    renderWithProviders(<ChatOverviewItem chat={chat} onClick={handleClick} />, {
      store,
      provider: { mui: true },
    });

    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledWith(chat.chatIdentifier.target);
  });
});
