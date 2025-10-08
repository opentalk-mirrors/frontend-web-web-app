// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Mock } from 'vitest';

import { useInviteCode } from '../../../hooks/useInviteCode';
import * as commonActions from '../../../store/commonActions';
import { mockStore, renderWithProviders } from '../../../utils/testUtils';
import MeetingEndedDialog from './MeetingEndedDialog';

const mockNavigate = vi.fn();

vi.mock('../../../hooks/useInviteCode', () => ({
  useInviteCode: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('MeetingEndedDialog', () => {
  const { store } = mockStore(0);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('dispatches hangUp and navigates when button is clicked', async () => {
    const mockSetIsDialogOpen = vi.fn();
    renderWithProviders(<MeetingEndedDialog setIsDialogOpen={mockSetIsDialogOpen} />, {
      store,
      provider: { mui: true, snackbar: true },
    });
    const spyHangUp = vi.spyOn(commonActions, 'hangUp');

    const leaveButton = screen.getByRole('button', { name: /meeting-ended-dialog-button-title/i });
    await userEvent.click(leaveButton);

    expect(spyHangUp).toHaveBeenCalledExactlyOnceWith();
    expect(mockNavigate).toHaveBeenCalledExactlyOnceWith('/dashboard');
  });

  it('does not navigate if inviteCode is present', async () => {
    (useInviteCode as Mock).mockReturnValue('some-code');
    const mockSetIsDialogOpen = vi.fn();

    renderWithProviders(<MeetingEndedDialog setIsDialogOpen={mockSetIsDialogOpen} />, {
      store,
      provider: { mui: true },
    });

    const spyHangUp = vi.spyOn(commonActions, 'hangUp');

    const leaveButton = screen.getByRole('button', { name: /meeting-ended-dialog-button-title/i });
    await userEvent.click(leaveButton);

    expect(spyHangUp).toHaveBeenCalledExactlyOnceWith();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
