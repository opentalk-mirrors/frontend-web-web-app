// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { LegalVoteId, PollId } from '../../../types';
import { configureStore, render, screen, cleanup, fireEvent } from '../../../utils/testUtils';
import VoteResult, { IVoteData, IVoteResult } from './VoteResult';
import { VoteType } from './constants';

describe('testing vote results', () => {
  const { store } = configureStore();
  afterAll(() => cleanup());

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
    onVote: jest.fn(),
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
    onVote: jest.fn(),
    multipleChoice: true,
  };

  test('component should render wothout breaking', async () => {
    await render(<VoteResult {...voteResultsProps} />, store);
    const yesRadioButton = screen.getByRole('radio', { name: voteResultsProps.title });

    expect(yesRadioButton).toBeInTheDocument();
    expect(yesRadioButton).not.toBeChecked();
    expect(screen.getByText('50.0%')).toBeInTheDocument();
  });

  test('on click should fire onVote event', async () => {
    await render(<VoteResult {...voteResultsProps} />, store);
    const yesRadioButton = screen.getByRole('radio', { name: voteResultsProps.title });
    expect(yesRadioButton).toBeInTheDocument();
    fireEvent.click(yesRadioButton);
    expect(yesRadioButton).toBeChecked();
    expect(voteResultsProps.onVote).toBeCalledTimes(1);
  });

  test('component should render checkbox if multiple choice is passed', async () => {
    await render(<VoteResult {...pollProps} />, store);
    const yesCheckbox = screen.getByRole('checkbox', { name: pollProps.title });

    expect(yesCheckbox).toBeInTheDocument();
    fireEvent.click(yesCheckbox);
    expect(yesCheckbox).toBeChecked();
  });
});
