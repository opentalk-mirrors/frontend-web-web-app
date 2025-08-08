// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ConfirmBrowserDialog from './ConfirmBrowserDialog';

vi.mock('../../modules/BrowserSupport');

const mockHandleClick = vi.fn();

describe('ConfirmBrowserDialog', () => {
  it('renders without crash', () => {
    render(<ConfirmBrowserDialog handleClick={mockHandleClick} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
  it('handles click', async () => {
    render(<ConfirmBrowserDialog handleClick={mockHandleClick} />);

    const submitButton = screen.getByRole('button', { name: /wrong-browser-dialog-ok/i });
    await userEvent.click(submitButton);

    expect(mockHandleClick).toHaveBeenCalledTimes(1);
  });
});
