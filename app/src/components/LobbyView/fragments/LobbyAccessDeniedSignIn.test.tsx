// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import LobbyAccessDeniedSignIn from './LobbyAccessDeniedSignIn';

const setup = () => {
  const onSignIn = vi.fn();
  const { store } = configureStore();
  renderWithProviders(<LobbyAccessDeniedSignIn onSignIn={onSignIn} />, {
    store,
    provider: { mui: true, router: true },
  });
  return { onSignIn, user: userEvent.setup({ delay: null }) };
};

describe('LobbyAccessDeniedSignIn', () => {
  it('informs that signing in is required', () => {
    setup();

    expect(screen.getByRole('heading', { name: 'lobby-sign-in-required-heading' })).toBeInTheDocument();
    expect(screen.getByText('lobby-sign-in-required-subtext')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'lobby-no-access-heading' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'lobby-switch-account' })).not.toBeInTheDocument();
    expect(screen.queryByText('lobby-signed-in-as')).not.toBeInTheDocument();
  });

  it('calls onSignIn on sign in', async () => {
    const { onSignIn, user } = setup();

    await user.click(screen.getByRole('button', { name: 'dashboard-sign-in' }));

    expect(onSignIn).toHaveBeenCalledOnce();
  });
});
