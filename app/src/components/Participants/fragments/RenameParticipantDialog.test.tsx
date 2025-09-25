// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, fireEvent, waitFor } from '@testing-library/react';

import { changeDisplayName } from '../../../api/types/outgoing/moderation';
import { renderWithProviders, mockedParticipant, configureStore } from '../../../utils/testUtils';
import RenameParticipantDialog from './RenameParticipantDialog';

describe('RenameParticipantDialog', () => {
  const participant = mockedParticipant(0);
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog with input and buttons', () => {
    const { store } = configureStore();
    renderWithProviders(<RenameParticipantDialog open={true} onClose={onClose} participant={participant} />, { store });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('participant-menu-rename-new-name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'global-save' })).toBeInTheDocument();
    expect(screen.getByLabelText('global-close-dialog')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const { store } = configureStore();

    renderWithProviders(<RenameParticipantDialog open={true} onClose={onClose} participant={participant} />, { store });
    fireEvent.click(screen.getByLabelText('global-close-dialog'));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows validation error if name is empty and submit is pressed', async () => {
    const { store, dispatchSpy } = configureStore();

    renderWithProviders(<RenameParticipantDialog open={true} onClose={onClose} participant={participant} />, { store });
    fireEvent.click(screen.getByRole('button', { name: 'global-save' }));
    expect(await screen.findByText(/field-error-required/)).toBeInTheDocument();
    expect(dispatchSpy.mock.calls).not.toContainEqual([
      changeDisplayName.action({ target: participant.id, newName: '' }),
    ]);
  });

  it('dispatches changeDisplayName and closes on valid submit', async () => {
    const { store, dispatchSpy } = configureStore();

    renderWithProviders(<RenameParticipantDialog open={true} onClose={onClose} participant={participant} />, { store });
    const input = screen.getByLabelText('participant-menu-rename-new-name');
    const NEW_NAME = 'New Name';
    fireEvent.change(input, { target: { value: NEW_NAME } });
    fireEvent.click(screen.getByRole('button', { name: 'global-save' }));
    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith(changeDisplayName.action({ target: participant.id, newName: NEW_NAME }));
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('does not render dialog when open is false', () => {
    const { store } = configureStore();

    renderWithProviders(<RenameParticipantDialog open={false} onClose={onClose} participant={participant} />, {
      store,
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
