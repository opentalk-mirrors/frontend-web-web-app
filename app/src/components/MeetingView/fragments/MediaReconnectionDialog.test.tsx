// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, screen } from '@testing-library/react';

import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import MediaReconnectionDialog from './MediaReconnectionDialog';

describe('MediaReconnectionDialog', () => {
  const { store, dispatchSpy } = configureStore();

  it('will render without errors', async () => {
    renderWithProviders(<MediaReconnectionDialog />, { store, provider: { mui: true } });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'breakout-room-notification-button-leave' })).toBeInTheDocument();
  });

  it('will call hangup', async () => {
    renderWithProviders(<MediaReconnectionDialog />, { store, provider: { mui: true } });

    fireEvent.click(screen.getByRole('button', { name: 'breakout-room-notification-button-leave' }));

    const dispatchedThunk = dispatchSpy.mock.calls[0][0];
    const dispatch = jest.fn();
    await dispatchedThunk(dispatch, store.getState, undefined);

    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'room/hangup/pending' }));
  });
});
