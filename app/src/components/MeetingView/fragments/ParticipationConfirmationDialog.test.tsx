// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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
    await userEvent.click(button);

    expect(dispatchSpy.mock.calls).toContainEqual([confirmPresence.action()]);
    expect(dispatchSpy.mock.calls).toContainEqual([presenceConfirmationDone()]);
  });

  it.each([true, false])(
    'renders dialog inside fullscreen element only if fullscreen is active (%s)',
    async (active) => {
      const fullscreenElement = document.createElement('div');
      document.body.appendChild(fullscreenElement);
      const { store } = configureStore({
        initialState: {
          room: { isPresenceConfirmationActive: true },
          fullscreen: { supported: true, active, error: undefined, element: fullscreenElement },
        },
      });

      try {
        renderWithProviders(<ParticipationConfirmationDialog />, { store, provider: { mui: true } });

        const dialog = await screen.findByRole('dialog');
        expect(fullscreenElement.contains(dialog)).toBe(active);
      } finally {
        fullscreenElement.remove();
      }
    }
  );
});
