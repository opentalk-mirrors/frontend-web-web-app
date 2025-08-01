// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { randomUUID } from 'crypto';

import { LegalVoteId } from '../../../types';
import { renderWithProviders } from '../../../utils/testUtils';
import { ReportSection } from './ReportSection';

const mockAppDispatch = vi.fn();

vi.mock('../../../hooks', () => ({
  useAppDispatch: () => mockAppDispatch,
  useAppSelector: vi.fn(),
}));

const mockLegalVote = {
  id: randomUUID() as LegalVoteId,
};

describe('ReportSection', () => {
  it('can render without an error', () => {
    render(<ReportSection legalVoteId={mockLegalVote.id} />);
    expect(screen.getByText('legal-vote-report-issue-title').tagName).toBe('BUTTON');
  });

  it('expands on button click', async () => {
    render(<ReportSection legalVoteId={mockLegalVote.id} />);

    fireEvent.click(screen.getByText('legal-vote-report-issue-title'));

    const elements = await screen.findAllByText('legal-vote-report-issue-title');
    expect(elements.length).toBe(2);
    expect(elements[1].tagName).toBe('H3');
  });

  it('collapses on cancel button click', async () => {
    render(<ReportSection legalVoteId={mockLegalVote.id} />);

    fireEvent.click(screen.getByText('legal-vote-report-issue-title'));
    fireEvent.click(screen.getByText('global-cancel'));

    const title = await screen.findByText('legal-vote-report-issue-title');
    expect(title.tagName).toBe('BUTTON');
  });

  it('can submit description', async () => {
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
