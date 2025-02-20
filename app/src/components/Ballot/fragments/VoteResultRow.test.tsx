// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '@testing-library/react';

import VoteResultRow from './VoteResultRow';

const mockDispatch = jest.fn();

jest.mock('../../../hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: jest.fn(),
}));

describe('VoteResultRow', () => {
  test('can render', () => {
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
