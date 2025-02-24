// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { renderWithProviders, configureStore } from '../../../utils/testUtils';
import InviteGuestDialog from './InviteGuestDialog';

describe('<InviteGuestDialog />', () => {
  const { store } = configureStore();

  test('render InviteGuestDialog component when flag open is true', () => {
    renderWithProviders(<InviteGuestDialog open />, { store, provider: { mui: true } });

    expect(screen.getByText('dialog-invite-guest-title')).toBeInTheDocument();
    expect(screen.getByLabelText('global-close-dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'global-close-dialog' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('dialog-invite-guest-no-expiration')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'dialog-invite-guest-button-submit' })).toBeInTheDocument();
  });

  test('with flag open={false} component should not be rendered', () => {
    renderWithProviders(<InviteGuestDialog open={false} />, { store });

    expect(screen.queryByText('dialog-invite-guest-title')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'global-close-dialog' })).not.toBeInTheDocument();
  });
});
