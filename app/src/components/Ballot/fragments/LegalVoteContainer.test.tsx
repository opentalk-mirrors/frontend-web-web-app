// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, screen } from '@testing-library/react';

import { useAppSelector } from '../../../hooks';
import { selectOurUuid } from '../../../store/slices/userSlice';
import { LegalVoteId, LegalVoteKind, LegalVoteState, LegalVote, ParticipantId } from '../../../types';
import { renderWithProviders } from '../../../utils/testUtils';
import { LegalVoteContainer } from './LegalVoteContainer';

const mockDispatch = jest.fn();

jest.mock('../../../hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: jest.fn(),
  useDateFormat: () => '',
}));

jest.mock('../../../store/slices/userSlice', () => ({
  selectOurUuid: jest.fn(),
}));

jest.mock('./VoteResultTable', () => ({
  __esModule: true,
  default: () => <div data-testid="result-table"></div>,
}));

jest.mock('./VoteResultDate', () => ({
  __esModule: true,
  default: ({ showTableHint, showResultsHandler }: { showTableHint: boolean; showResultsHandler(): void }) =>
    showTableHint && <button onClick={showResultsHandler} data-testid="vote-result-date"></button>,
}));

describe('LegalVoteContainer', () => {
  const legalVote: LegalVote = {
    id: 'test-id' as LegalVoteId,
    state: LegalVoteState.Started,
    startTime: new Date(Date.now()).toISOString(),
    votes: {
      yes: 0,
      no: 0,
      abstain: 0,
    },
    allowedParticipants: [],
    votingRecord: {},
    initiatorId: 'asd' as ParticipantId,
    maxVotes: 0,
    name: 'Legal Vote Test',
    subtitle: 'Legal Vote Subtitle',
    topic: 'Legal Vote Topic',
    enableAbstain: false,
    autoClose: false,
    duration: 60,
    createPdf: false,
    kind: LegalVoteKind.RollCall,
  };

  it('can render', () => {
    renderWithProviders(<LegalVoteContainer legalVote={legalVote} onClose={jest.fn()} isAllowedToVote />, {
      provider: { mui: true },
    });
    expect(screen.getByText(legalVote.name)).toBeInTheDocument();
    expect(screen.getByText(legalVote.subtitle ?? '')).toBeInTheDocument();
    expect(screen.getByText(legalVote.topic ?? '')).toBeInTheDocument();
  });

  it('executes onClose callback when close button is clicked.', () => {
    const onClose = jest.fn();
    renderWithProviders(<LegalVoteContainer legalVote={legalVote} onClose={onClose} isAllowedToVote />, {
      provider: { mui: true },
    });
    fireEvent.click(screen.getByLabelText('global-close-dialog'));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows message to user who is not allowed to vote', () => {
    const vote: LegalVote = {
      ...legalVote,
      allowedParticipants: ['our-id' as ParticipantId],
    };
    renderWithProviders(<LegalVoteContainer legalVote={vote} onClose={jest.fn()} isAllowedToVote={false} />, {
      provider: { mui: true },
    });
    expect(screen.getByText('legal-vote-not-selected')).toBeInTheDocument();
  });

  it('shows submit button to user who can place a vote', () => {
    const mockedUuid = 'mocked-uuid';
    const vote: LegalVote = {
      ...legalVote,
      allowedParticipants: [mockedUuid as ParticipantId],
    };
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      if (selector === selectOurUuid) {
        return mockedUuid;
      }
      return null;
    });
    renderWithProviders(<LegalVoteContainer legalVote={vote} onClose={jest.fn()} isAllowedToVote />, {
      provider: { mui: true },
    });
    expect(screen.getByText('global-submit')).toBeInTheDocument();
  });

  it('can show result table', () => {
    const mockedUuid = 'mocked-uuid';
    const vote: LegalVote = {
      ...legalVote,
      kind: LegalVoteKind.Pseudonymous,
      state: LegalVoteState.Finished,
      userVote: {
        votedAt: new Date().toISOString(),
        selectedOption: 'yes',
      },
      votingRecord: {
        ['1' as ParticipantId]: 'yes',
        ['2' as ParticipantId]: 'no',
      },
      allowedParticipants: [mockedUuid as ParticipantId],
    };
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      if (selector === selectOurUuid) {
        return mockedUuid;
      }
      return null;
    });
    renderWithProviders(<LegalVoteContainer legalVote={vote} onClose={jest.fn()} isAllowedToVote />, {
      provider: { mui: true },
    });
    fireEvent.click(screen.getByTestId('vote-result-date'));
    expect(screen.getByTestId('result-table')).toBeInTheDocument();
  });
});
