// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';

import { renderWithProviders } from '../../../utils/testUtils';
import LobbyPasswordStep from './LobbyPasswordStep';

vi.mock('../../LobbyLayout', () => ({
  default: ({ center, bottom }: { center: ReactNode; bottom: ReactNode }) => (
    <div>
      {center}
      {bottom}
    </div>
  ),
}));

describe('LobbyPasswordStep', () => {
  it('renders the heading, subtext, password field and continue button', () => {
    renderWithProviders(<LobbyPasswordStep onSubmit={vi.fn()} />, { provider: { mui: true } });

    expect(screen.getByText('lobby-password-step-heading')).toBeInTheDocument();
    expect(screen.getByText('lobby-password-step-subtext')).toBeInTheDocument();
    const passwordInput = screen.getByPlaceholderText('lobby-password-placeholder');
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(screen.getByRole('button', { name: 'global-continue' })).toBeInTheDocument();
  });

  it('does not reveal any meeting information', () => {
    renderWithProviders(<LobbyPasswordStep onSubmit={vi.fn()} />, { provider: { mui: true } });

    expect(screen.queryByPlaceholderText('lobby-name-placeholder')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'joinform-enter-now' })).not.toBeInTheDocument();
  });

  it('keeps the continue button disabled until a password is entered', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<LobbyPasswordStep onSubmit={vi.fn()} />, { provider: { mui: true } });

    expect(screen.getByRole('button', { name: 'global-continue' })).toBeDisabled();

    await user.type(screen.getByPlaceholderText('lobby-password-placeholder'), 'secret');

    await waitFor(() => expect(screen.getByRole('button', { name: 'global-continue' })).toBeEnabled());
  });

  it('calls onSubmit with the entered password on continue', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<LobbyPasswordStep onSubmit={onSubmit} />, { provider: { mui: true } });

    await user.type(screen.getByPlaceholderText('lobby-password-placeholder'), 'secret');
    await user.click(screen.getByRole('button', { name: 'global-continue' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith('secret'));
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<LobbyPasswordStep onSubmit={vi.fn()} />, { provider: { mui: true } });

    const passwordInput = screen.getByPlaceholderText('lobby-password-placeholder');
    expect(passwordInput).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: 'toggle-password-visibility' }));

    expect(passwordInput).toHaveAttribute('type', 'text');
  });
});
