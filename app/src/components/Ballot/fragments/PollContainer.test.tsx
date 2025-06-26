// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { Poll } from '../../../store/slices/pollSlice';
import { ChoiceId, PollId } from '../../../types';
import { PollContainer } from './PollContainer';

type ComponentProps = {
  onVote(): void;
  title: string;
};

const mockDispatch = jest.fn();

jest.mock('../../../hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: jest.fn(),
  useDateFormat: () => '',
}));

jest.mock('./VoteResult', () => ({
  __esModule: true,
  default: ({ onVote, title }: ComponentProps) => (
    <button data-testid="vote-result" onClick={onVote}>
      {title}
    </button>
  ),
  VoteType: {
    Poll: 'Poll',
  },
}));

describe('PollContainer', () => {
  const poll: Poll = {
    id: 'custom-id' as PollId,
    state: 'active',
    voted: false,
    results: [],
    choices: [
      {
        id: 1 as ChoiceId,
        content: 'Option A',
      },
      {
        id: 2 as ChoiceId,
        content: 'Option B',
      },
    ],
    live: false,
    multipleChoice: false,
    topic: 'Test Poll',
    duration: 60,
    startTime: new Date().toISOString(),
  };

  it('renders expected elements', async () => {
    render(<PollContainer poll={poll} onClose={jest.fn()} />);

    expect(await screen.findByText(poll.topic)).toBeInTheDocument();
    expect(screen.getAllByTestId('vote-result')).toHaveLength(2);
    expect(screen.getByText('global-submit')).toBeInTheDocument();
  });

  it('has disabled submit button when no option is selected', async () => {
    render(<PollContainer poll={poll} onClose={jest.fn()} />);

    expect(await screen.findByRole('button', { name: 'global-submit' })).toBeDisabled();
  });

  it('has submit button enabled when option is selected', async () => {
    render(<PollContainer poll={poll} onClose={jest.fn()} />);

    fireEvent.click(screen.getByText('Option A'));

    expect(await screen.findByRole('button', { name: 'global-submit' })).not.toBeDisabled();
  });

  it('has submit button disabled when choise is submitted.', async () => {
    render(<PollContainer poll={{ ...poll, voted: true }} onClose={jest.fn()} />);

    fireEvent.click(screen.getByText('Option A'));

    expect(await screen.findByRole('button', { name: 'global-submit' })).toBeDisabled();
  });

  it('executed onClose callback when close button is clicked', async () => {
    const onClose = jest.fn();
    render(<PollContainer poll={poll} onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'global-close-dialog' }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });
});
