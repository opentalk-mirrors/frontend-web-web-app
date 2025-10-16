// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, screen } from '@testing-library/react';

import { confirmPresence } from '../../../api/types/outgoing/trainingParticipationReport';
import { presenceConfirmationDone } from '../../../store/slices/roomSlice';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import { ParticipationConfirmationDialog } from './ParticipationConfirmationDialog';

vi.mock('../../../modules/WebRTC/ConferenceRoom', async (importOriginal) => ({
  ...(await importOriginal()),
  getCurrentConferenceRoom: () => ({
    sendMessage: vi.fn(),
  }),
}));

describe('ParticipationConfirmationDialog', () => {
  const { store: storeNotOngoing } = configureStore({
    initialState: {
      room: {
        isPresenceConfirmationActive: false,
      },
    },
  });
  const { store: storeOngoing, dispatchSpy } = configureStore({
    initialState: {
      room: {
        isPresenceConfirmationActive: true,
      },
    },
  });

  it('show dialog if confirmationCheckpointOngoing is true', async () => {
    renderWithProviders(<ParticipationConfirmationDialog />, { store: storeOngoing, provider: { mui: true } });

    expect(await screen.findByText('participation-confirmation-dialog-title')).toBeInTheDocument();
    expect(screen.getByText('participation-confirmation-dialog-description')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'participation-confirmation-dialog-confirm-button' })
    ).toBeInTheDocument();
  });

  it('hide dialog if confirmationCheckpointOngoing is false', () => {
    renderWithProviders(<ParticipationConfirmationDialog />, { store: storeNotOngoing, provider: { mui: true } });

    expect(screen.queryByText('participation-confirmation-dialog-title')).not.toBeInTheDocument();
  });

  it('dispatch correct actions if button is clicked', async () => {
    renderWithProviders(<ParticipationConfirmationDialog />, { store: storeOngoing });
    const button = await screen.findByRole('button', { name: 'participation-confirmation-dialog-confirm-button' });
    fireEvent.click(button);

    expect(dispatchSpy.mock.calls).toContainEqual([confirmPresence.action()]);
    expect(dispatchSpy.mock.calls).toContainEqual([presenceConfirmationDone()]);
  });
});
