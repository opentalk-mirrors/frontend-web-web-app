// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '@testing-library/react';

import VoteResultCountRow from './VoteResultCountRow';

describe('VoteResultCountRow', () => {
  test('can render', () => {
    render(<VoteResultCountRow total={10} />, {
      wrapper: ({ children }) => (
        <table>
          <tbody>{children}</tbody>
        </table>
      ),
    });
    expect(screen.getByText(10)).toBeInTheDocument();
  });
});
