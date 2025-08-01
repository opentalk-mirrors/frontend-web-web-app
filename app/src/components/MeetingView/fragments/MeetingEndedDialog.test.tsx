// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, fireEvent } from '@testing-library/react';
import { Mock } from 'vitest';

import { useInviteCode } from '../../../hooks/useInviteCode';
import { mockStore, renderWithProviders } from '../../../utils/testUtils';
import MeetingEndedDialog from './MeetingEndedDialog';

const mockDispatch = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../../../hooks', () => ({
  useAppDispatch: () => mockDispatch,
}));

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

  it('dispatches hangUp and navigates when button is clicked', () => {
    const mockSetIsDialogOpen = vi.fn();
    renderWithProviders(<MeetingEndedDialog setIsDialogOpen={mockSetIsDialogOpen} />, {
      store,
      provider: { mui: true },
    });

    const leaveButton = screen.getByRole('button', { name: /meeting-ended-dialog-button-title/i });
    fireEvent.click(leaveButton);

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('does not navigate if inviteCode is present', () => {
    (useInviteCode as Mock).mockReturnValue('some-code');
    const mockSetIsDialogOpen = vi.fn();

    renderWithProviders(<MeetingEndedDialog setIsDialogOpen={mockSetIsDialogOpen} />, {
      store,
      provider: { mui: true },
    });

    const leaveButton = screen.getByRole('button', { name: /meeting-ended-dialog-button-title/i });
    fireEvent.click(leaveButton);

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
