// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LegalVoteId, PollId } from '../../../types';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import VoteResult, { IVoteData, IVoteResult } from './VoteResult';
import { VoteType } from './constants';

describe('testing vote results', () => {
  const { store } = configureStore();

  const voteData: IVoteData = {
    numberOfVotes: 0,
    votePercentage: 50,
    isVotable: true,
    voteId: '1234' as LegalVoteId,
    currentVotes: 0,
  };

  const voteResultsProps: IVoteResult = {
    voteType: VoteType.LegalVote,
    title: 'Yes',
    optionIndex: 1,
    voteData: voteData,
    showResult: true,
    onVote: vi.fn(),
  };

  const pollData: IVoteData = {
    numberOfVotes: 0,
    votePercentage: 50,
    isVotable: true,
    voteId: '1234' as PollId,
    currentVotes: 0,
  };

  const pollProps: IVoteResult = {
    voteType: VoteType.Poll,
    title: '1',
    optionIndex: 0,
    voteData: pollData,
    onVote: vi.fn(),
    multipleChoice: true,
  };

  it('should render without breaking', () => {
    renderWithProviders(<VoteResult {...voteResultsProps} />, { store, provider: { mui: true } });
    const yesRadioButton = screen.getByRole('radio', { name: voteResultsProps.title });

    expect(yesRadioButton).toBeInTheDocument();
    expect(yesRadioButton).not.toBeChecked();
    expect(screen.getByText('50.0%')).toBeInTheDocument();
  });

  it('should fire onVote event on click', async () => {
    const user = userEvent.setup();
    renderWithProviders(<VoteResult {...voteResultsProps} />, { store, provider: { mui: true } });
    const yesRadioButton = screen.getByRole('radio', { name: voteResultsProps.title });
    expect(yesRadioButton).toBeInTheDocument();

    await user.click(yesRadioButton);

    expect(yesRadioButton).toBeChecked();
    expect(voteResultsProps.onVote).toHaveBeenCalledTimes(1);
  });

  it('should render checkbox if multiple choice is passed', async () => {
    const user = userEvent.setup();
    renderWithProviders(<VoteResult {...pollProps} />, { store, provider: { mui: true } });
    const yesCheckbox = screen.getByRole('checkbox', { name: pollProps.title });

    expect(yesCheckbox).toBeInTheDocument();
    await user.click(yesCheckbox);
    expect(yesCheckbox).toBeChecked();
  });
});
