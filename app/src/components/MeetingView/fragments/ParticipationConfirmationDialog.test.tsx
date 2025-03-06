// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, screen } from '@testing-library/react';

import { confirmPresence } from '../../../api/types/outgoing/trainingParticipationReport';
import { presenceConfirmationDone } from '../../../store/slices/roomSlice';
import { createStore, renderWithProviders } from '../../../utils/testUtils';
import { ParticipationConfirmationDialog } from './ParticipationConfirmationDialog';

describe('ParticipationConfirmationDialog', () => {
  const { store: storeNotOngoing } = createStore({
    initialState: {
      room: {
        isPresenceConfirmationActive: false,
      },
    },
  });
  const { store: storeOngoing, dispatch } = createStore({
    initialState: {
      room: {
        isPresenceConfirmationActive: true,
      },
    },
  });

  test('show dialog if confirmationCheckpointOngoing is true', () => {
    renderWithProviders(<ParticipationConfirmationDialog />, { store: storeOngoing, provider: { mui: true } });

    expect(screen.getByText('participation-confirmation-dialog-title')).toBeInTheDocument();
    expect(screen.getByText('participation-confirmation-dialog-description')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'participation-confirmation-dialog-confirm-button' })
    ).toBeInTheDocument();
  });

  test('hide dialog if confirmationCheckpointOngoing is false', () => {
    renderWithProviders(<ParticipationConfirmationDialog />, { store: storeNotOngoing, provider: { mui: true } });

    expect(screen.queryByText('participation-confirmation-dialog-title')).not.toBeInTheDocument();
  });

  test('dispatch correct actions if button is clicked', () => {
    renderWithProviders(<ParticipationConfirmationDialog />, { store: storeOngoing });

    fireEvent.click(screen.getByRole('button', { name: 'participation-confirmation-dialog-confirm-button' }));

    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch).toHaveBeenCalledWith(confirmPresence.action());
    expect(dispatch).toHaveBeenCalledWith(presenceConfirmationDone());
  });
});
