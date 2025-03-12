// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, fireEvent } from '@testing-library/react';

import { useInviteCode } from '../../../hooks/useInviteCode';
import { mockStore, renderWithProviders } from '../../../utils/testUtils';
import MeetingEndedDialog from './MeetingEndedDialog';

const mockDispatch = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../../../hooks', () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock('../../../hooks/useInviteCode', () => ({
  useInviteCode: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('MeetingEndedDialog', () => {
  const { store } = mockStore(0);

  it('dispatches hangUp and navigates when button is clicked', () => {
    renderWithProviders(<MeetingEndedDialog />, { store, provider: { mui: true } });

    const leaveButton = screen.getByRole('button', { name: /meeting-ended-dialog-button-title/i });
    fireEvent.click(leaveButton);

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('does not navigate if inviteCode is present', () => {
    (useInviteCode as jest.Mock).mockReturnValue('some-code');

    renderWithProviders(<MeetingEndedDialog />, { store, provider: { mui: true } });

    const leaveButton = screen.getByRole('button', { name: /meeting-ended-dialog-button-title/i });
    fireEvent.click(leaveButton);

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
