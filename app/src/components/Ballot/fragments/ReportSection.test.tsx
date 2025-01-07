// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { randomUUID } from 'crypto';

import { LegalVoteId } from '../../../types';
import { fireEvent, render, screen, waitFor } from '../../../utils/testUtils';
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
  it('can render without an error', async () => {
    await render(<ReportSection legalVoteId={mockLegalVote.id} />);
    expect(screen.getByText('legal-vote-report-issue-title').tagName).toBe('BUTTON');
  });

  it('expands on button click', async () => {
    await render(<ReportSection legalVoteId={mockLegalVote.id} />);

    fireEvent.click(screen.getByText('legal-vote-report-issue-title'));

    await waitFor(() => {
      const elements = screen.getAllByText('legal-vote-report-issue-title');
      expect(elements.length).toBe(2);
      // expect(elements[0]).not.toBeVisible(); // button is made offscreen but we don't have tools to detect that
      expect(elements[1].tagName).toBe('H3');
    });
  });

  it('collapses on cancel button click', async () => {
    await render(<ReportSection legalVoteId={mockLegalVote.id} />);

    fireEvent.click(screen.getByText('legal-vote-report-issue-title'));
    fireEvent.click(screen.getByText('global-cancel'));

    await waitFor(() => {
      expect(screen.getByText('legal-vote-report-issue-title').tagName).toBe('BUTTON');
    });
  });

  it('can submit description', async () => {
    await render(<ReportSection legalVoteId={mockLegalVote.id} />);

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
