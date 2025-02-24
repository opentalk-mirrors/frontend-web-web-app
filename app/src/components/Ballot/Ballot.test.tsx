// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
import { fireEvent, render, screen } from '@testing-library/react';

import { useAppSelector as mockUseAppSelector } from '../../hooks';
import { mockLegalVote, mockPoll } from '../../utils/testUtils';
import Ballot from './Ballot';

// eslint-disable-next-line no-var
var mockDispatch = jest.fn();

jest.mock('../../hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: jest.fn(),
}));

jest.mock('./fragments/PollContainer', () => ({
  PollContainer: () => <div data-testid="poll-container"></div>,
}));

jest.mock('./fragments/LegalVoteContainer', () => ({
  LegalVoteContainer: () => <div data-testid="legal-vote-container"></div>,
}));

jest.mock('./fragments/ReportSection', () => ({
  ReportSection: () => <div data-testid="report-section"></div>,
}));

// SPDX-License-Identifier: EUPL-1.2
describe('Ballot', () => {
  test('empty render on missing ids.', () => {
    (mockUseAppSelector as jest.Mock).mockReturnValue(undefined);
    render(<Ballot />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  describe('poll and legal vote', () => {
    afterEach(() => {
      (mockUseAppSelector as jest.Mock).mockReset();
    });

    test('can render poll dialog', () => {
      (mockUseAppSelector as jest.Mock)
        .mockReturnValueOnce(undefined) // voteIdToShow
        .mockReturnValueOnce(undefined) // pollIdToShow
        .mockReturnValueOnce(undefined) // voteOrPollIdToShow
        .mockReturnValueOnce(mockPoll); // pollToShow

      render(<Ballot />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByTestId('poll-container')).toBeInTheDocument();
    });

    test('can render legal vote dialog with report section', () => {
      (mockUseAppSelector as jest.Mock)
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

    test('executes onClose callback on escape key', () => {
      (mockUseAppSelector as jest.Mock)
        .mockReturnValueOnce(undefined) // voteIdToShow
        .mockReturnValueOnce(undefined) // pollIdToShow
        .mockReturnValueOnce(undefined) // voteOrPollIdToShow
        .mockReturnValueOnce(mockPoll); // pollToShow

      render(<Ballot />);
      const dialog = screen.getByRole('dialog');
      fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape', charCode: 0 });
      expect(mockDispatch).toBeCalledTimes(3);
    });
  });
});
