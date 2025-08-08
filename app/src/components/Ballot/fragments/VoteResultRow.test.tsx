// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '@testing-library/react';

import VoteResultRow from './VoteResultRow';

const mockDispatch = vi.fn();

vi.mock('../../../hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: vi.fn(),
}));

describe('VoteResultRow', () => {
  it('can render', () => {
    render(<VoteResultRow participantId="" selectedVote="no" token="test-token" />, {
      wrapper: ({ children }) => (
        <table>
          <tbody>{children}</tbody>
        </table>
      ),
    });
    expect(screen.getByText('test-token')).toBeInTheDocument();
  });
});
