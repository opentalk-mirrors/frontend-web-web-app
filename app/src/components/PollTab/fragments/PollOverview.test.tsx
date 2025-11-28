// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Poll, PollFormValues } from '../../../store/slices/pollSlice';
import { ChoiceId, PollId } from '../../../types';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import PollOverview from './PollOverview';

const mockPollOverviewPanel = vi.fn();

vi.mock('./PollOverviewPanel', () => ({
  __esModule: true,
  default: (props: { poll: Poll }) => {
    mockPollOverviewPanel(props.poll);
    return <div data-testid="poll-panel">{props.poll.topic}</div>;
  },
}));

describe('PollOverview', () => {
  it('renders empty state when no polls or saved polls exist', () => {
    const { store } = configureStore();

    renderWithProviders(<PollOverview onClickItem={vi.fn()} />, { store, provider: { mui: true } });

    expect(screen.getByText('no-polls-in-conference')).toBeInTheDocument();
  });

  it('renders saved polls and forwards click to handler', async () => {
    const savedPoll: PollFormValues = {
      id: 7,
      topic: 'Saved topic',
      duration: 3,
      live: false,
      multipleChoice: true,
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
    const onClickItem = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(<PollOverview onClickItem={onClickItem} />, { store, provider: { mui: true } });

    expect(screen.getByText('poll-overview-saved-polls')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Saved topic' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Saved topic' }));
    expect(onClickItem).toHaveBeenCalledWith(savedPoll.id);
  });

  it('renders created polls using PollOverviewPanel', () => {
    const poll: Poll = {
      id: 'poll-1' as PollId,
      topic: 'Live poll',
      duration: 60,
      choices: [{ id: 1 as ChoiceId, content: 'A' }],
      results: [],
      startTime: new Date().toISOString(),
      state: 'active',
      live: false,
      multipleChoice: false,
      voted: false,
    };
    const { store } = configureStore({
      initialState: {
        poll: {
          polls: { ids: [poll.id], entities: { [poll.id]: poll } },
          savedPolls: [],
          showResult: false,
        },
      },
    });

    renderWithProviders(<PollOverview onClickItem={vi.fn()} />, { store, provider: { mui: true } });

    expect(screen.getByText('poll-overview-created-polls')).toBeInTheDocument();
    expect(screen.getAllByTestId('poll-panel')).toHaveLength(1);
    expect(mockPollOverviewPanel).toHaveBeenCalledWith(expect.objectContaining({ id: poll.id }));
  });
});
