// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import { format } from 'date-fns';

import { DisconnectReason } from '../../../api/types/incoming/core';
import { RoomEvent } from '../../../store/slices/eventSlice';
import { ChatMessage as ChatMessageType, ChatScope, ParticipantId, Role } from '../../../types';
import { MeetingNotesAccess } from '../../../types';
import { configureStore, mockedParticipant, renderWithProviders } from '../../../utils/testUtils';
import ChatMessage from './ChatMessage';

vi.mock('../../../hooks', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('../../../hooks');

  return {
    ...actual,
    useDateFormat: (date: Date = new Date(), output: 'date' | 'time' | 'attribute-date' = 'date') => {
      switch (output) {
        case 'time':
          return format(date, 'HH:mm');
        case 'attribute-date':
          return format(date, 'yyyy-MM-dd');
        default:
          return format(date, 'P');
      }
    },
  };
});

describe('ChatMessage', () => {
  const renderComponent = (message: ChatMessageType | RoomEvent, initialState = {}) => {
    const { store } = configureStore({ initialState });

    renderWithProviders(<ChatMessage message={message} />, { store, provider: { mui: true } });
  };

  it('renders chat enabled event messages', () => {
    const participant = mockedParticipant(0);
    const event: RoomEvent = {
      id: 'event-1',
      timestamp: '2024-01-01T12:00:00.000Z',
      target: participant.id,
      event: 'chat_enabled',
    };

    renderComponent(event, {
      participants: {
        ids: [participant.id],
        entities: { [participant.id]: participant },
      },
    });

    expect(screen.getByText('chat-enabled-message')).toBeInTheDocument();
  });

  it('shows participant and removal text when a user is forced to leave', () => {
    const participant = mockedParticipant(1);
    const event: RoomEvent = {
      id: 'event-2',
      timestamp: '2024-02-01T08:00:00.000Z',
      target: participant.id,
      event: 'left',
      reason: DisconnectReason.Kicked,
    };

    renderComponent(event, {
      participants: {
        ids: [participant.id],
        entities: { [participant.id]: participant },
      },
    });

    expect(screen.getByTestId('user-event-message')).toBeInTheDocument();
    expect(screen.getByText(participant.displayName)).toBeInTheDocument();
    expect(screen.getByText('participant-removed-event')).toBeInTheDocument();
  });

  it('renders own messages with the current user name and timestamp', () => {
    const participant = mockedParticipant(2);
    const timestamp = '2024-03-05T10:15:00.000Z';
    const message: ChatMessageType = {
      id: 'message-1',
      timestamp,
      source: participant.id,
      content: 'Hello there',
      scope: ChatScope.Global,
    };

    renderComponent(message, {
      participants: {
        ids: [participant.id],
        entities: { [participant.id]: participant },
      },
      user: {
        uuid: participant.id,
        displayName: 'Current User',
        avatarUrl: 'avatar.png',
        groups: [],
        role: Role.User,
        meetingNotesAccess: MeetingNotesAccess.None,
        isRoomOwner: false,
      },
    });

    expect(screen.getByText('Current User')).toBeInTheDocument();
    expect(screen.getByText(format(new Date(timestamp), 'HH:mm'))).toBeInTheDocument();
  });

  it('shows the moderator indicator and styles single emoji messages', () => {
    const moderator = { ...mockedParticipant(3), role: Role.Moderator };
    const message: ChatMessageType = {
      id: 'message-2',
      timestamp: '2024-04-01T09:00:00.000Z',
      source: moderator.id,
      content: '😀',
      scope: ChatScope.Global,
    };

    renderComponent(message, {
      participants: {
        ids: [moderator.id],
        entities: { [moderator.id]: moderator },
      },
      user: {
        uuid: 'current-user' as ParticipantId,
        displayName: 'Current User',
        groups: [],
        role: Role.User,
        meetingNotesAccess: MeetingNotesAccess.None,
        isRoomOwner: false,
      },
    });

    expect(screen.getByTitle('moderator-icon-title')).toBeInTheDocument();
    expect(screen.getByText('😀')).toBeInTheDocument();
  });
});
