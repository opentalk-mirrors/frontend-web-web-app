// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { randomUUID } from 'crypto';

import { LegalVoteId } from '../../../types';
import { renderWithProviders } from '../../../utils/testUtils';
import { ReportSection } from './ReportSection';

const mockAppDispatch = jest.fn();

jest.mock('../../../hooks', () => ({
  useAppDispatch: () => mockAppDispatch,
  useAppSelector: jest.fn(),
}));

const mockLegalVote = {
  id: randomUUID() as LegalVoteId,
};

describe('ReportSection', () => {
  test('can render without an error', () => {
    render(<ReportSection legalVoteId={mockLegalVote.id} />);
    expect(screen.getByText('legal-vote-report-issue-title').tagName).toBe('BUTTON');
  });

  test('expands on button click', () => {
    render(<ReportSection legalVoteId={mockLegalVote.id} />);

    fireEvent.click(screen.getByText('legal-vote-report-issue-title'));

    const elements = screen.getAllByText('legal-vote-report-issue-title');
    expect(elements.length).toBe(2);
    // expect(elements[0]).not.toBeVisible(); // button is made offscreen but we don't have tools to detect that
    expect(elements[1].tagName).toBe('H3');
  });

  test('collapses on cancel button click', () => {
    render(<ReportSection legalVoteId={mockLegalVote.id} />);

    fireEvent.click(screen.getByText('legal-vote-report-issue-title'));
    fireEvent.click(screen.getByText('global-cancel'));

    expect(screen.getByText('legal-vote-report-issue-title').tagName).toBe('BUTTON');
  });

  test('can submit description', async () => {
    renderWithProviders(<ReportSection legalVoteId={mockLegalVote.id} />, { provider: { snackbar: true, mui: true } });

    fireEvent.click(screen.getByText('legal-vote-report-issue-title'));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'testing description' } });
    fireEvent.click(screen.getByText('legal-vote-report-issue-inform-moderator'));

    await waitFor(() => {
      expect(mockAppDispatch.mock.calls[0][0]).toEqual({
        type: 'signaling/legal_vote/report_issue',
        payload: {
          legal_vote_id: mockLegalVote.id,
          description: 'testing description',
        },
      });
    });
  });
});
