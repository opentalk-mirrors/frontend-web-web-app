// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, render, screen } from '@testing-library/react';
import { Mock } from 'vitest';

import { useAppSelector } from '../../hooks';
import { mockLegalVote, mockPoll } from '../../utils/testUtils';
import Ballot from './Ballot';

const mockDispatch = vi.fn();

vi.mock('../../hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: vi.fn(),
}));

vi.mock('./fragments/PollContainer', () => ({
  PollContainer: () => <div data-testid="poll-container"></div>,
}));

vi.mock('./fragments/LegalVoteContainer', () => ({
  LegalVoteContainer: () => <div data-testid="legal-vote-container"></div>,
}));

vi.mock('./fragments/ReportSection', () => ({
  ReportSection: () => <div data-testid="report-section"></div>,
}));

describe('Ballot', () => {
  it('renders empty on missing ids', () => {
    (useAppSelector as unknown as Mock).mockReturnValue(undefined);
    render(<Ballot />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  describe('poll and legal vote', () => {
    afterEach(() => {
      (useAppSelector as unknown as Mock).mockReset();
    });

    it('can render poll dialog', () => {
      (useAppSelector as unknown as Mock)
        .mockReturnValueOnce(undefined) // voteIdToShow
        .mockReturnValueOnce(undefined) // pollIdToShow
        .mockReturnValueOnce(undefined) // voteOrPollIdToShow
        .mockReturnValueOnce(mockPoll); // pollToShow

      render(<Ballot />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByTestId('poll-container')).toBeInTheDocument();
    });

    it('can render legal vote dialog with report section', () => {
      (useAppSelector as unknown as Mock)
        .mockReturnValueOnce(undefined) // voteIdToShow
        .mockReturnValueOnce(undefined) // pollIdToShow
        .mockReturnValueOnce(undefined) // voteOrPollIdToShow
        .mockReturnValueOnce(undefined) // pollToShow
        .mockReturnValueOnce(mockLegalVote) // legalVoteToShow
        .mockReturnValueOnce('8342a2bf-b63e-422f-9fb8-7409ef997606'); // ourUuid

      render(<Ballot />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByTestId('legal-vote-container')).toBeInTheDocument();
      expect(screen.getByTestId('report-section')).toBeInTheDocument();
    });

    it('executes onClose callback on escape key', () => {
      (useAppSelector as unknown as Mock)
        .mockReturnValueOnce(undefined) // voteIdToShow
        .mockReturnValueOnce(undefined) // pollIdToShow
        .mockReturnValueOnce(undefined) // voteOrPollIdToShow
        .mockReturnValueOnce(mockPoll); // pollToShow

      render(<Ballot />);
      const dialog = screen.getByRole('dialog');
      fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape', charCode: 0 });
      expect(mockDispatch).toHaveBeenCalledTimes(3);
    });
  });
});
