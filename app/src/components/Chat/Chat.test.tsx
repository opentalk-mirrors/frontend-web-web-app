// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Store } from '@reduxjs/toolkit';
import { screen, waitFor, fireEvent, act } from '@testing-library/react';

import { AppDispatch } from '../../store';
import { join, leave } from '../../store/slices/participantsSlice';
import { ParticipantId, ParticipationKind, MeetingNotesAccess, WaitingState } from '../../types';
import { renderWithProviders, configureStore } from '../../utils/testUtils';
import Chat from './Chat';

describe('Chat component', () => {
  let store: Store;
  let dispatch: AppDispatch;
  let dispatchSpy: jest.SpiedFunction<AppDispatch>;

  beforeEach(() => {
    const createdStore = configureStore({
      initialState: {
        chat: {
          enabled: true,
          messages: {
            ids: [],
            entities: {},
          },
        },
        user: {
          uuid: '1234546',
        },
        events: {
          ids: [],
          entities: {},
        },
        participants: {
          ids: [],
          entities: {},
        },
      },
    });
    store = createdStore.store;
    dispatch = createdStore.store.dispatch;
    dispatchSpy = createdStore.dispatchSpy;
  });

  test('chat component should be displayed with encrypted message on initial load', () => {
    renderWithProviders(<Chat />, { store });

    expect(screen.getByTestId('chat')).toBeInTheDocument();
    expect(screen.getByTestId('no-messages')).toBeInTheDocument();
  });

  test('should display event message when user join conversation', async () => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    renderWithProviders(<Chat />, { store });

    act(() => {
      dispatch(
        join({
          participant: {
            id: '123' as ParticipantId,
            displayName: 'Test',
            groups: [],
            handIsUp: false,
            joinedAt: '2023-09-22T12:15:00.000000000Z',
            leftAt: null,
            handUpdatedAt: '',
            breakoutRoomId: null,
            participationKind: ParticipationKind.User,
            lastActive: '',
            waitingState: WaitingState.Joined,
            meetingNotesAccess: MeetingNotesAccess.None,
            isRoomOwner: false,
          },
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('chat')).toBeInTheDocument();
      expect(screen.getByTestId('combined-messages')).toBeInTheDocument();
      expect(screen.getByTestId('user-event-message')).toBeInTheDocument();
    });
  });

  test('should display event message when user leave conversation', async () => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    renderWithProviders(<Chat />, { store });

    act(() => {
      dispatch(
        leave({
          id: '123' as ParticipantId,
          timestamp: '2023-09-22T12:15:00.000000000Z',
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('chat')).toBeInTheDocument();
      expect(screen.getByTestId('combined-messages')).toBeInTheDocument();
      expect(screen.getByTestId('user-event-message')).toBeInTheDocument();
    });
  });

  test('should dispatch action when user send messsage', async () => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    renderWithProviders(<Chat />, { store });

    const message = screen.getByPlaceholderText('chat-input-placeholder');

    fireEvent.change(message, { target: { value: 'Test' } });

    await waitFor(() => {
      const button = screen.getByTestId('send-message-button');
      button.click();
    });

    await waitFor(() => {
      expect(dispatchSpy.mock.calls).toContainEqual([
        {
          type: 'signaling/chat/send_message',
          payload: { content: 'Test', scope: 'global' },
        },
      ]);
    });
  });

  test('should display error if input is empty on sumbit', async () => {
    renderWithProviders(<Chat />, { store });

    const message = screen.getByPlaceholderText('chat-input-placeholder');

    fireEvent.change(message, { target: { value: '' } });

    await waitFor(() => {
      const button = screen.getByTestId('send-message-button');
      button.click();
    });

    await waitFor(() => {
      expect(screen.getByText(/chat-input-error-required/i)).toBeInTheDocument();
    });
  });

  test('should autofocus message input when `autoFocusMessageInput` property is specified', () => {
    renderWithProviders(<Chat autoFocusMessageInput={true} />, { store });

    expect(document.activeElement?.tagName).toBe('TEXTAREA');
  });
});
