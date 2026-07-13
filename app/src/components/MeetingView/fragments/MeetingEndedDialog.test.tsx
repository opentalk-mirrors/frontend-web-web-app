// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import MeetingEndedDialog from './MeetingEndedDialog';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('MeetingEndedDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls navigate when button is clicked', async () => {
    const { store } = configureStore({ initialState: { auth: { state: 'authorized' } } });
    renderWithProviders(<MeetingEndedDialog />, {
      store,
      provider: { mui: true, snackbar: true },
    });

    const leaveButton = screen.getByRole('button', { name: /meeting-ended-dialog-button-title/i });
    await userEvent.click(leaveButton);

    expect(mockNavigate).toHaveBeenCalledExactlyOnceWith('/dashboard');
  });

  it('cannot be closed by pressing escape', async () => {
    const { store } = configureStore({ initialState: { auth: { state: 'authorized' } } });
    renderWithProviders(<MeetingEndedDialog />, {
      store,
      provider: { mui: true },
    });

    await userEvent.keyboard('{Escape}');

    const title = screen.getByText(/meeting-ended-dialog-title/i);
    expect(title).toBeInTheDocument();
  });

  it('cannot be closed by clicking outside', async () => {
    const { store } = configureStore({ initialState: { auth: { state: 'authorized' } } });
    renderWithProviders(<MeetingEndedDialog />, {
      store,
      provider: { mui: true },
    });

    await userEvent.click(document.body);

    const title = screen.getByText(/meeting-ended-dialog-title/i);
    expect(title).toBeInTheDocument();
  });

  it('shows no button for guests (not authenticated)', () => {
    const { store } = configureStore({ initialState: { auth: { state: 'anonymous' } } });
    renderWithProviders(<MeetingEndedDialog />, {
      store,
      provider: { mui: true },
    });
    const leaveButton = screen.queryByRole('button', { name: /meeting-ended-dialog-button-title/i });
    expect(leaveButton).not.toBeInTheDocument();
  });
});
