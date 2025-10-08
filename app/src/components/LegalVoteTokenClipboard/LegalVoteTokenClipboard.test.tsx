// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../utils/testUtils';
import { LegalVoteTokenClipboard } from './LegalVoteTokenClipboard';

vi.mock('../../hooks', () => ({
  useDateFormat: () => (date: Date, format: string) => {
    if (format === 'date') {
      return date.toLocaleDateString();
    }
    if (format === 'time') {
      return date.toLocaleTimeString();
    }
    return '';
  },
}));

vi.mock('../../hooks/useCustomRedux', () => ({
  useAppSelector: vi.fn(),
  useAppDispatch: vi.fn(),
}));

describe('LegalVoteTokenClipboard', () => {
  it('renders without crashing', () => {
    expect(() => render(<LegalVoteTokenClipboard name="name" timestamp="" token="token" vote="" />)).not.toThrow();
  });

  it('places content into clipboard on button click', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    renderWithProviders(<LegalVoteTokenClipboard name="name" timestamp="" token="token" vote="" />, {
      provider: { snackbar: true, mui: true },
    });
    const button = screen.getByRole('button', { name: 'Copy token' });
    await userEvent.click(button);
    expect(navigator.clipboard.writeText).toHaveBeenCalledExactlyOnceWith(expect.stringContaining('name'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledExactlyOnceWith(expect.stringContaining('token'));
  });
});
