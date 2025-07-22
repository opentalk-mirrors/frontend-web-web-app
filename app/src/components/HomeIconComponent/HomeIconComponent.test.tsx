// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { configureStore, renderWithProviders } from '../../utils/testUtils';
import HomeIconComponent from './HomeIconComponent';

describe('HomeIconComponent', () => {
  it('shows unread badge when there are unread global messages', () => {
    const { store } = configureStore({
      initialState: {
        ui: { activeTab: 'unknown' },
        chat: {
          scope: {
            global: {
              messages: {
                ids: ['1'],
                entities: {
                  '1': { id: '1', content: 'Hello', timestamp: new Date().toISOString(), source: 'participant-123' },
                },
              },
              nextIndex: null,
              lastSeenTimestamp: new Date(Date.now() - 5000).toISOString(),
            },
          },
        },
      },
    });
    renderWithProviders(<HomeIconComponent />, { store });
    expect(screen.getByRole('presentation', { hidden: true })).toBeInTheDocument();
  });

  it('shows unread badge when there are unread private messages', () => {
    const { store } = configureStore({
      initialState: {
        ui: { activeTab: 'unknown' },
        chat: {
          scope: {
            global: {
              messages: {
                ids: [],
                entities: {},
              },
              nextIndex: null,
              lastSeenTimestamp: null,
            },
            private: {
              'participant-123': {
                messages: {
                  ids: ['1'],
                  entities: {
                    '1': { id: '1', content: 'Hello', timestamp: new Date().toISOString(), source: 'participant-123' },
                  },
                },
                nextIndex: null,
                lastSeenTimestamp: new Date(Date.now() - 5000).toISOString(),
              },
            },
          },
        },
      },
    });
    renderWithProviders(<HomeIconComponent />, { store });
    expect(screen.getByRole('presentation', { hidden: true })).toBeInTheDocument();
  });
});
