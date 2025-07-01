// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, render, screen } from '@testing-library/react';

import { LegalVoteTokenClipboard } from './LegalVoteTokenClipboard';

jest.mock('../../hooks', () => ({
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

jest.mock('../../commonComponents', () => ({
  ...jest.requireActual('../../commonComponents'),
  notifications: {
    success: jest.fn(),
  },
}));

describe('LegalVoteTokenClipboard', () => {
  it('renders without crashing', () => {
    expect(() => render(<LegalVoteTokenClipboard name="name" timestamp="" token="token" vote="" />)).not.toThrow();
  });

  it('places content into clipboard on button click', () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: jest.fn().mockResolvedValue(undefined) },
    });
    render(<LegalVoteTokenClipboard name="name" timestamp="" token="token" vote="" />);
    const button = screen.getByRole('button', { name: 'Copy token' });
    fireEvent.click(button);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('name'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('token'));
  });
});
