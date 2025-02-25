// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import MediaReconnectionDialog from './MediaReconnectionDialog';

describe('MediaReconnectionDialog', () => {
  test('will render without errors', async () => {
    const { store } = configureStore();

    renderWithProviders(<MediaReconnectionDialog />, { store, provider: { mui: true } });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'breakout-room-notification-button-leave' })).toBeInTheDocument();
  });
});
