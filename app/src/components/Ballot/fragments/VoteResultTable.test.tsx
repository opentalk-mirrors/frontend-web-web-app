// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { TableCell, TableRow } from '@mui/material';
import { screen, waitFor, within } from '@testing-library/react';

import { LegalVote, LegalVoteId, LegalVoteOption, LegalVoteState, ParticipantId, Timestamp } from '../../../types';
import { renderWithProviders } from '../../../utils/testUtils';
import VoteResultTable from './VoteResultTable';

const mockUseAppSelector = vi.fn();

const mockVoteResultRow = vi.fn((props: { participantId: string; token: string; selectedVote: string }) => (
  <TableRow data-testid="vote-result-row">
    <TableCell>{props.participantId}</TableCell>
    <TableCell>{props.token}</TableCell>
    <TableCell>{props.selectedVote}</TableCell>
  </TableRow>
));

vi.mock('../../../hooks', () => ({
  useAppSelector: (selector: unknown) => mockUseAppSelector(selector),
}));

vi.mock('./VoteResultRow', () => ({
  __esModule: true,
  default: (props: { participantId: string; token: string; selectedVote: string }) => mockVoteResultRow(props),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

const createVote = (overrides?: Partial<LegalVote>): LegalVote => ({
  id: 'vote-id' as LegalVoteId,
  state: LegalVoteState.Finished,
  name: 'Test vote',
  subtitle: 'subtitle',
  topic: 'topic',
  enableAbstain: true,
  autoClose: false,
  duration: 60,
  createPdf: false,
  allowedParticipants: [],
  initiatorId: 'initiator-1' as ParticipantId,
  startTime: new Date('2023-01-01T00:00:00Z').toISOString() as Timestamp,
  endTime: new Date('2023-01-01T00:10:00Z').toISOString() as Timestamp,
  maxVotes: 10,
  votes: { yes: 0, no: 0, abstain: 0 },
  votingRecord: {},
  live: true,
  pseudonymous: false,
  ...overrides,
});

describe('VoteResultTable', () => {
  beforeEach(() => {
    mockUseAppSelector.mockReset();
    mockVoteResultRow.mockClear();
  });

  it('returns null when vote is missing', () => {
    const scrollToResults = vi.fn();
    mockUseAppSelector.mockReturnValue(undefined);

    renderWithProviders(<VoteResultTable voteId={'missing-id' as LegalVoteId} scrollToResults={scrollToResults} />, {
      provider: { mui: true },
    });

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(scrollToResults).not.toHaveBeenCalled();
  });

  it('shows empty state when no participants are present', async () => {
    const vote = createVote({ votingRecord: {} });
    const scrollToResults = vi.fn();
    mockUseAppSelector.mockReturnValue(vote);

    renderWithProviders(<VoteResultTable voteId={vote.id} scrollToResults={scrollToResults} />, {
      provider: { mui: true },
    });

    expect(await screen.findByText('legal-vote-no-results')).toBeInTheDocument();
    expect(screen.queryByText('Total')).not.toBeInTheDocument();
    await waitFor(() => expect(scrollToResults).toHaveBeenCalledTimes(1));
  });

  it('renders pseudonymous results with tokens and totals', async () => {
    const vote = createVote({
      pseudonymous: true,
      votingRecord: {
        'token-1': LegalVoteOption.Yes,
        'token-2': LegalVoteOption.No,
      } as Record<ParticipantId, LegalVoteOption>,
      votes: { yes: 1, no: 1, abstain: 0 },
    });
    const scrollToResults = vi.fn();
    mockUseAppSelector.mockReturnValue(vote);

    renderWithProviders(<VoteResultTable voteId={vote.id} scrollToResults={scrollToResults} />, {
      provider: { mui: true },
    });

    const rows = screen.getAllByTestId('vote-result-row');
    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getByText('token-1')).toBeInTheDocument();
    expect(within(rows[1]).getByText('token-2')).toBeInTheDocument();
    expect(mockVoteResultRow).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ participantId: '', token: 'token-1', selectedVote: 'yes' })
    );
    expect(mockVoteResultRow).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ participantId: '', token: 'token-2', selectedVote: 'no' })
    );
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText(/^2$/)).toBeInTheDocument();
    await waitFor(() => expect(scrollToResults).toHaveBeenCalledTimes(1));
  });

  it('passes participant id for non-pseudonymous votes', async () => {
    const vote = createVote({
      votingRecord: {
        'participant-1': LegalVoteOption.Abstain,
      } as Record<ParticipantId, LegalVoteOption>,
      votes: { yes: 0, no: 0, abstain: 1 },
    });
    const scrollToResults = vi.fn();
    mockUseAppSelector.mockReturnValue(vote);

    renderWithProviders(<VoteResultTable voteId={vote.id} scrollToResults={scrollToResults} />, {
      provider: { mui: true },
    });

    expect(mockVoteResultRow).toHaveBeenCalledWith(
      expect.objectContaining({ participantId: 'participant-1', token: '', selectedVote: 'abstain' })
    );
    expect(screen.getByText(/^1$/)).toBeInTheDocument();
    await waitFor(() => expect(scrollToResults).toHaveBeenCalledTimes(1));
  });
});
