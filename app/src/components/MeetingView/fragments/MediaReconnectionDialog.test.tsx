// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import * as commonActions from '../../../store/commonActions';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import MediaReconnectionDialog from './MediaReconnectionDialog';

describe('MediaReconnectionDialog', () => {
  const { store, dispatchSpy } = configureStore();

  it('will render without errors', async () => {
    renderWithProviders(<MediaReconnectionDialog />, { store, provider: { mui: true, snackbar: true } });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'breakout-room-notification-button-leave' })).toBeInTheDocument();
  });

  it('will call hangup', async () => {
    renderWithProviders(<MediaReconnectionDialog />, { store, provider: { snackbar: true, mui: true } });
    const spyHangUp = vi.spyOn(commonActions, 'hangUp');
    const hangupButton = screen.getByRole('button', { name: 'breakout-room-notification-button-leave' });

    await userEvent.click(hangupButton);

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(spyHangUp).toHaveBeenCalledTimes(1);
  });
});
