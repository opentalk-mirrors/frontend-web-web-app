// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import ResultsList from './ResultsList';

jest.mock('./ResultsItem', () => ({
  __esModule: true,
  default: () => <div>ResultsItem</div>,
}));

describe('ResultsList rendering logic', () => {
  it('should render without crashing', () => {
    const { store } = configureStore({
      initialState: {
        legalVote: {
          votes: {
            ids: [],
            entities: {},
          },
        },
      },
    });
    expect(() => renderWithProviders(<ResultsList />, { store })).not.toThrow();
  });

  it('renders title', () => {
    const { store } = configureStore({
      initialState: {
        legalVote: {
          votes: {
            ids: [],
            entities: {},
          },
        },
      },
    });
    renderWithProviders(<ResultsList />, { store });
    expect(screen.getByText('votes-poll-overview-title')).toBeInTheDocument();
  });

  it('should render ResultsItem for each vote', () => {
    const { store } = configureStore({
      initialState: {
        legalVote: {
          votes: {
            ids: ['vote1', 'vote2'],
            entities: {
              vote1: { id: 'vote1', title: 'Vote 1' },
              vote2: { id: 'vote2', title: 'Vote 2' },
            },
          },
        },
      },
    });
    renderWithProviders(<ResultsList />, { store });
    expect(screen.getAllByText('ResultsItem')).toHaveLength(2);
  });

  it('should render ResultsItem for each poll', () => {
    const { store } = configureStore({
      initialState: {
        poll: {
          polls: {
            ids: ['poll1', 'poll2'],
            entities: {
              poll1: { id: 'poll1', title: 'Poll 1' },
              poll2: { id: 'poll2', title: 'Poll 2' },
            },
          },
        },
      },
    });
    renderWithProviders(<ResultsList />, { store });
    expect(screen.getAllByText('ResultsItem')).toHaveLength(2);
  });
});
