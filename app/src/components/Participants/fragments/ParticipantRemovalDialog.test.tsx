// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { notifications } from '../../../commonComponents';
import { renderWithProviders, mockedParticipant, configureStore } from '../../../utils/testUtils';
import ParticipantRemovalDialog from './ParticipantRemovalDialog';

describe('ParticipantRemovalDialog', () => {
  const participant = mockedParticipant(0);
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog with title, content, and buttons', async () => {
    const { store } = configureStore();

    renderWithProviders(<ParticipantRemovalDialog open={true} onClose={onClose} participant={participant} />, {
      store,
    });

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('participant-remove-dialog-title')).toBeInTheDocument();
    expect(screen.getByText('participant-remove-dialog-content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'participant-remove-dialog-cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'participant-remove-dialog-confirm' })).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', async () => {
    const { store } = configureStore();
    renderWithProviders(<ParticipantRemovalDialog open={true} onClose={onClose} participant={participant} />, {
      store,
    });
    await userEvent.click(screen.getByRole('button', { name: 'participant-remove-dialog-cancel' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when close icon is clicked', async () => {
    const { store } = configureStore();
    renderWithProviders(<ParticipantRemovalDialog open={true} onClose={onClose} participant={participant} />, {
      store,
    });
    await userEvent.click(screen.getByLabelText('global-close-dialog'));
    expect(onClose).toHaveBeenCalled();
  });

  it('dispatches kick and enableWaitingRoom, shows notification, and closes on confirm', async () => {
    const { store, dispatchSpy } = configureStore();
    const spyNotificationInfo = vi.spyOn(notifications, 'info').mockImplementation(() => {});
    renderWithProviders(<ParticipantRemovalDialog open={true} onClose={onClose} participant={participant} />, {
      store,
      provider: { mui: true, snackbar: true },
    });
    await userEvent.click(screen.getByRole('button', { name: 'participant-remove-dialog-confirm' }));
    // Check that dispatch was called for kick and enableWaitingRoom
    expect(dispatchSpy).toHaveBeenCalledTimes(2);
    expect(spyNotificationInfo).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('does not render dialog when open is false', () => {
    const { store } = configureStore();
    renderWithProviders(<ParticipantRemovalDialog open={false} onClose={onClose} participant={participant} />, {
      store,
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
