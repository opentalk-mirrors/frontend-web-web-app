// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PollFormValues } from '../../store/slices/pollSlice';
import { configureStore, renderWithProviders } from '../../utils/testUtils';
import PollTab from './PollTab';

vi.mock('./fragments/PollOverview', () => ({
  __esModule: true,
  default: ({ onClickItem }: { onClickItem: (id: number | undefined) => void }) => (
    <div>
      <span>poll-overview-stub</span>
      <button aria-label="open-saved-poll" onClick={() => onClickItem(1)}>
        open-saved-poll
      </button>
    </div>
  ),
}));

vi.mock('./fragments/CreatePollForm', () => ({
  __esModule: true,
  default: (props: { initialValues?: PollFormValues; onClose: () => void }) => (
    <div>
      <span>create-poll-form</span>
      <button onClick={props.onClose}>close-form</button>
      <div data-testid="initial-values">{JSON.stringify(props.initialValues)}</div>
    </div>
  ),
}));

describe('PollTab', () => {
  it('shows poll overview by default', () => {
    const { store } = configureStore();

    renderWithProviders(<PollTab />, { store, provider: { mui: true } });

    expect(screen.getByText('poll-overview-stub')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'poll-overview-button-create-poll' })).toBeInTheDocument();
    expect(screen.queryByText('create-poll-form')).not.toBeInTheDocument();
  });

  it('switches to create poll form when create button is clicked', async () => {
    const { store } = configureStore();
    const user = userEvent.setup();

    renderWithProviders(<PollTab />, { store, provider: { mui: true } });
    await user.click(screen.getByRole('button', { name: 'poll-overview-button-create-poll' }));

    expect(screen.getByText('create-poll-form')).toBeInTheDocument();
    expect(screen.queryByText('poll-overview-stub')).not.toBeInTheDocument();
  });

  it('opens saved poll with initial values', async () => {
    const savedPoll: PollFormValues = {
      id: 1,
      topic: 'Saved topic',
      duration: 5,
      live: false,
      multipleChoice: false,
      choices: ['A', 'B'],
    };
    const { store } = configureStore({
      initialState: {
        poll: {
          polls: { ids: [], entities: {} },
          savedPolls: [savedPoll],
          showResult: false,
        },
      },
    });
    const user = userEvent.setup();

    renderWithProviders(<PollTab />, { store, provider: { mui: true } });
    await user.click(screen.getByRole('button', { name: 'open-saved-poll' }));

    expect(screen.getByText('create-poll-form')).toBeInTheDocument();
    expect(screen.getByTestId('initial-values').textContent).toBe(JSON.stringify(savedPoll));
  });

  it('returns to overview when form is closed', async () => {
    const { store } = configureStore();
    const user = userEvent.setup();

    renderWithProviders(<PollTab />, { store, provider: { mui: true } });
    await user.click(screen.getByRole('button', { name: 'poll-overview-button-create-poll' }));
    await user.click(screen.getByText('close-form'));

    expect(screen.getByText('poll-overview-stub')).toBeInTheDocument();
  });
});
