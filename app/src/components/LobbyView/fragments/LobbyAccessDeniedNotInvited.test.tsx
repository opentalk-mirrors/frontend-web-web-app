// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import LobbyAccessDeniedNotInvited from './LobbyAccessDeniedNotInvited';

const setup = (displayName?: string) => {
  const onSwitchAccount = vi.fn();
  const { store } = configureStore();
  renderWithProviders(<LobbyAccessDeniedNotInvited displayName={displayName} onSwitchAccount={onSwitchAccount} />, {
    store,
    provider: { mui: true, router: true },
  });
  return { onSwitchAccount, user: userEvent.setup({ delay: null }) };
};

describe('LobbyAccessDeniedNotInvited', () => {
  it('informs that the meeting is restricted to invited participants', () => {
    setup('Alice');

    expect(screen.getByRole('heading', { name: 'lobby-no-access-heading' })).toBeInTheDocument();
    expect(screen.getByText('lobby-no-access-subtext')).toBeInTheDocument();
    expect(screen.getByText('lobby-signed-in-as')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'lobby-sign-in-required-heading' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'dashboard-sign-in' })).not.toBeInTheDocument();
  });

  it('does not show the signed in account while the user name is unknown', () => {
    setup();

    expect(screen.queryByText('lobby-signed-in-as')).not.toBeInTheDocument();
  });

  it('calls onSwitchAccount on switch account', async () => {
    const { onSwitchAccount, user } = setup('Alice');

    await user.click(screen.getByRole('button', { name: 'lobby-switch-account' }));

    expect(onSwitchAccount).toHaveBeenCalledOnce();
  });
});
