// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { finish } from '../../../api/types/outgoing/poll';
import { ChoiceId, PollId } from '../../../types';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import PollOverviewPanel from './PollOverviewPanel';

vi.mock('../../../hooks', async (importOriginal) => ({
  ...(await importOriginal()),
  useDateFormat: () => '12:00',
}));

vi.mock('../../../commonComponents', () => ({
  ProgressBar: (props: unknown) => <div data-testid="progress-bar" data-props={JSON.stringify(props)} />,
}));

vi.mock('../../VoteAndPollCountdown', () => ({
  __esModule: true,
  default: () => <div data-testid="poll-countdown">countdown</div>,
}));

describe('PollOverviewPanel', () => {
  const basePoll = {
    id: 'poll-1' as PollId,
    topic: 'A very long poll topic that should maybe be truncated if necessary',
    duration: 60,
    choices: [{ id: 1 as ChoiceId, content: 'A' }],
    results: [
      { id: 1 as ChoiceId, count: 2 },
      { id: 2 as ChoiceId, count: 3 },
    ],
    startTime: new Date('2024-01-01T12:00:00Z').toISOString(),
    state: 'active' as const,
    live: false,
    multipleChoice: false,
    voted: false,
  };

  it('shows status, time, topic, votes and countdown', () => {
    const { store } = configureStore();

    renderWithProviders(<PollOverviewPanel poll={basePoll} />, { store, provider: { mui: true } });

    expect(screen.getByText('poll-overview-panel-status-active')).toBeInTheDocument();
    expect(screen.getByText('12:00')).toBeInTheDocument();
    expect(screen.getByText(/A very long poll topic/)).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // total votes
    expect(screen.getByTestId('poll-countdown')).toBeInTheDocument();
    expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
  });

  it('dispatches finish action when end button is clicked for active poll', async () => {
    const { store, dispatchSpy } = configureStore();
    const user = userEvent.setup();

    renderWithProviders(<PollOverviewPanel poll={basePoll} />, { store, provider: { mui: true } });

    await user.click(screen.getByRole('button', { name: 'poll-overview-panel-button-end' }));

    expect(dispatchSpy).toHaveBeenCalledWith(
      finish.action({
        id: basePoll.id,
      })
    );
  });

  it('hides end button when poll is finished', () => {
    const { store } = configureStore();

    renderWithProviders(<PollOverviewPanel poll={{ ...basePoll, state: 'finished' }} />, {
      store,
      provider: { mui: true },
    });

    expect(screen.queryByRole('button', { name: 'poll-overview-panel-button-end' })).not.toBeInTheDocument();
  });
});
