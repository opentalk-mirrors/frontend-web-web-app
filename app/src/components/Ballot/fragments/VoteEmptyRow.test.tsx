// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '@testing-library/react';

import VoteEmptyRow from './VoteEmptyRow';

describe('VoteEmptyRow', () => {
  it('can render', () => {
    render(<VoteEmptyRow />, {
      wrapper: ({ children }) => (
        <table>
          <tbody>{children}</tbody>
        </table>
      ),
    });
    expect(screen.getByText('legal-vote-no-results')).toBeInTheDocument();
  });
});
