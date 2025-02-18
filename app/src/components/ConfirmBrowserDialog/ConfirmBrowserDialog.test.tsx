// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '@testing-library/react';

import ConfirmBrowserDialog from './ConfirmBrowserDialog';

jest.mock('../../modules/BrowserSupport');

const mockHandleClick = jest.fn();

describe('ConfirmBrowserDialog', () => {
  test('rendered without crash', () => {
    render(<ConfirmBrowserDialog handleClick={mockHandleClick} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
  test('handle click is fired', () => {
    render(<ConfirmBrowserDialog handleClick={mockHandleClick} />);

    const submitButton = screen.getByRole('button', { name: /wrong-browser-dialog-ok/i });
    submitButton.click();

    expect(mockHandleClick).toHaveBeenCalledTimes(1);
  });
});
