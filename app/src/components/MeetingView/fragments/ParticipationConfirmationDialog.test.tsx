// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import { ParticipationConfirmationDialog } from './ParticipationConfirmationDialog';

describe('ParticipationConfirmationDialog', () => {
  test('will render without errors', async () => {
    const { store } = configureStore({
      initialState: {
        room: {
          isPresenceConfirmationActive: true,
        },
      },
    });

    renderWithProviders(<ParticipationConfirmationDialog />, { store, provider: { mui: true } });

    expect(
      screen.getByRole('button', { name: 'participation-confirmation-dialog-confirm-button' })
    ).toBeInTheDocument();
  });
});
