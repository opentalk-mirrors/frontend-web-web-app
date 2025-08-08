// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, screen } from '@testing-library/react';

import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import VotesAndPollsResultsPopover from './VotesAndPollsResultsPopover';

vi.mock('./ResultsList', () => ({
  __esModule: true,
  default: () => (
    <ul aria-label="ResultsList">
      <li>Result Item 1</li>
      <li>Result Item 2</li>
    </ul>
  ),
}));

describe('VotesAndPollsResultsPopover rendering logic', () => {
  it('should not render if there are no polls or votes', () => {
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
    renderWithProviders(<VotesAndPollsResultsPopover />, { store, provider: { snackbar: true } });
    expect(screen.queryByRole('button', { name: 'votes-poll-button-show' })).not.toBeInTheDocument();
  });

  it('should render if there are polls or votes', () => {
    const { store } = configureStore({
      initialState: {
        legalVote: {
          votes: {
            ids: ['1'],
            entities: {
              '1': {},
            },
          },
        },
      },
    });
    renderWithProviders(<VotesAndPollsResultsPopover />, { store, provider: { snackbar: true } });
    expect(screen.getByRole('button', { name: 'votes-poll-button-show' })).toBeInTheDocument();
  });

  it('should render result list when expanded', () => {
    const { store } = configureStore({
      initialState: {
        legalVote: {
          votes: {
            ids: ['1'],
            entities: {
              '1': {},
            },
          },
        },
      },
    });
    renderWithProviders(<VotesAndPollsResultsPopover />, { store, provider: { snackbar: true } });
    const button = screen.getByRole('button', { name: 'votes-poll-button-show' });
    fireEvent.click(button);
    const resultsList = screen.getByRole('list', { hidden: true, name: 'ResultsList' });
    expect(resultsList).toBeInTheDocument();
  });
});
