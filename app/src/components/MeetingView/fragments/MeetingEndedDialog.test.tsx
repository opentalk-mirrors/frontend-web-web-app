// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Mock } from 'vitest';

import { useInviteCode } from '../../../hooks/useInviteCode';
import { mockStore, renderWithProviders } from '../../../utils/testUtils';
import MeetingEndedDialog from './MeetingEndedDialog';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../../../hooks/useInviteCode', () => ({
  useInviteCode: vi.fn(),
}));

describe('MeetingEndedDialog', () => {
  const { store } = mockStore(0);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls navigate when button is clicked', async () => {
    renderWithProviders(<MeetingEndedDialog />, {
      store,
      provider: { mui: true, snackbar: true },
    });

    const leaveButton = screen.getByRole('button', { name: /meeting-ended-dialog-button-title/i });
    await userEvent.click(leaveButton);

    expect(mockNavigate).toHaveBeenCalledExactlyOnceWith('/dashboard');
  });

  it('cannot be closed by pressing escape', async () => {
    renderWithProviders(<MeetingEndedDialog />, {
      store,
      provider: { mui: true },
    });

    await userEvent.keyboard('{Escape}');

    const title = screen.getByText(/meeting-ended-dialog-title/i);
    expect(title).toBeInTheDocument();
  });

  it('cannot be closed by clicking outside', async () => {
    renderWithProviders(<MeetingEndedDialog />, {
      store,
      provider: { mui: true },
    });

    await userEvent.click(document.body);

    const title = screen.getByText(/meeting-ended-dialog-title/i);
    expect(title).toBeInTheDocument();
  });

  it('shows no button when invite code is present', () => {
    (useInviteCode as Mock).mockReturnValue('some-code');
    renderWithProviders(<MeetingEndedDialog />, {
      store,
      provider: { mui: true },
    });
    const leaveButton = screen.queryByRole('button', { name: /meeting-ended-dialog-button-title/i });
    expect(leaveButton).not.toBeInTheDocument();
  });
});
