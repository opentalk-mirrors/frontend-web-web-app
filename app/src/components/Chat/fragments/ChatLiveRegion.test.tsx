// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { ParticipantId } from '../../../types';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import ChatLiveRegion from './ChatLiveRegion';

const initialStore = {
  initialState: {
    chat: {
      scope: {
        global: {
          messages: {
            ids: ['1'],
            entities: {
              '1': {
                id: '1',
                content: 'Test message',
                timestamp: new Date(Date.now() - 5000).toISOString(),
              },
            },
          },
        },
      },
    },
    user: {
      uuid: '1234546' as ParticipantId,
    },
  },
};

it('does not announce messages that were received before the live region was rendered', () => {
  const { store } = configureStore(initialStore);
  renderWithProviders(<ChatLiveRegion />, { store });

  expect(screen.queryByTestId('chat-announcement')).not.toBeInTheDocument();
});

it('announces message from other user that was received after the live region was rendered', () => {
  const { store } = configureStore({
    initialState: {
      ...initialStore.initialState,
      chat: {
        scope: {
          global: {
            messages: {
              ids: ['1'],
              entities: {
                '1': {
                  id: '1',
                  content: 'Test message',
                  timestamp: new Date(Date.now() + 5000).toISOString(),
                  source: '789012' as ParticipantId,
                },
              },
            },
          },
        },
      },
    },
  });

  renderWithProviders(<ChatLiveRegion />, { store });
  expect(screen.getByText('chat-live-message-announcemenet')).toBeInTheDocument();
});

it('ignores messages from us that were received after the live region was rendered', () => {
  const { store } = configureStore({
    initialState: {
      ...initialStore.initialState,
      chat: {
        scope: {
          global: {
            messages: {
              ids: ['1'],
              entities: {
                '1': {
                  id: '1',
                  content: 'Test message',
                  timestamp: new Date(Date.now() + 5000).toISOString(),
                  source: initialStore.initialState.user.uuid,
                },
              },
            },
          },
        },
      },
    },
  });

  renderWithProviders(<ChatLiveRegion />, { store });
  expect(screen.queryByTestId('chat-announcement')).not.toBeInTheDocument();
});
