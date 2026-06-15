// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { disableGuestAccess } from '../../../api/types/outgoing/moderation';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import DisableGuestAccessDialog from './DisableGuestAccessDialog';

vi.mock('../../../modules/WebRTC/ConferenceRoom', async (importOriginal) => ({
  ...(await importOriginal()),
  getCurrentConferenceRoom: () => ({
    sendMessage: vi.fn(),
  }),
}));

describe('DisableGuestAccessDialog', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders title, content and buttons', () => {
    const { store } = configureStore();
    renderWithProviders(<DisableGuestAccessDialog open={true} onClose={onClose} />, {
      store,
      provider: { mui: true },
    });

    expect(screen.getByText('disable-guest-access-dialog-title')).toBeInTheDocument();
    expect(screen.getByText('disable-guest-access-dialog-content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'disable-guest-access-dialog-cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'disable-guest-access-dialog-confirm' })).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    const { store } = configureStore();
    renderWithProviders(<DisableGuestAccessDialog open={false} onClose={onClose} />, {
      store,
      provider: { mui: true },
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('dispatches disableGuestAccess and closes on confirm', async () => {
    const { store, dispatchSpy } = configureStore();
    renderWithProviders(<DisableGuestAccessDialog open={true} onClose={onClose} />, {
      store,
      provider: { mui: true },
    });
    await userEvent.click(screen.getByRole('button', { name: 'disable-guest-access-dialog-confirm' }));
    expect(dispatchSpy.mock.calls).toContainEqual([disableGuestAccess.action()]);
    expect(onClose).toHaveBeenCalled();
  });

  it('closes without dispatching on cancel', async () => {
    const { store, dispatchSpy } = configureStore();
    renderWithProviders(<DisableGuestAccessDialog open={true} onClose={onClose} />, {
      store,
      provider: { mui: true },
    });
    await userEvent.click(screen.getByRole('button', { name: 'disable-guest-access-dialog-cancel' }));
    expect(dispatchSpy.mock.calls).not.toContainEqual([disableGuestAccess.action()]);
    expect(onClose).toHaveBeenCalled();
  });
});
