// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../../utils/testUtils';
import AccountAction from './AccountAction';

const setup = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const onSignIn = vi.fn();
  const onSwitchAccount = vi.fn();
  const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());

  // Rendered inside a form, as in the lobby, to ensure the actions don't submit the join form
  renderWithProviders(
    <form onSubmit={onSubmit}>
      <AccountAction isLoggedIn={isLoggedIn} onSignIn={onSignIn} onSwitchAccount={onSwitchAccount} />
    </form>,
    { provider: { mui: true } }
  );

  return { onSignIn, onSwitchAccount, onSubmit, user: userEvent.setup({ delay: null }) };
};

describe('AccountAction', () => {
  describe('logged in', () => {
    it('shows the switch account action only', () => {
      setup({ isLoggedIn: true });

      expect(screen.getByRole('button', { name: 'lobby-switch-account' })).toBeInTheDocument();
      expect(screen.queryByText('lobby-already-registered')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'dashboard-sign-in' })).not.toBeInTheDocument();
    });

    it('calls onSwitchAccount without submitting the surrounding form', async () => {
      const { onSignIn, onSwitchAccount, onSubmit, user } = setup({ isLoggedIn: true });

      await user.click(screen.getByRole('button', { name: 'lobby-switch-account' }));

      expect(onSwitchAccount).toHaveBeenCalledOnce();
      expect(onSignIn).not.toHaveBeenCalled();
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('not logged in', () => {
    it('shows the sign in hint and action only', () => {
      setup({ isLoggedIn: false });

      expect(screen.getByText('lobby-already-registered')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'dashboard-sign-in' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'lobby-switch-account' })).not.toBeInTheDocument();
    });

    it('calls onSignIn without submitting the surrounding form', async () => {
      const { onSignIn, onSwitchAccount, onSubmit, user } = setup({ isLoggedIn: false });

      await user.click(screen.getByRole('button', { name: 'dashboard-sign-in' }));

      expect(onSignIn).toHaveBeenCalledOnce();
      expect(onSwitchAccount).not.toHaveBeenCalled();
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });
});
