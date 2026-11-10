// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useAuthActions } from '../../../hooks/useAuthActions';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import ErrorActionButtons from './ErrorActionButtons';

vi.mock('../../../hooks/useAuthActions', () => ({ useAuthActions: vi.fn() }));

const signIn = vi.fn();
const signOut = vi.fn();

const setup = (props: { login?: boolean; logout?: boolean }) => {
  const { store } = configureStore();
  renderWithProviders(<ErrorActionButtons {...props} />, { store, provider: { router: true, mui: true } });
  return { user: userEvent.setup({ delay: null }) };
};

describe('ErrorActionButtons auth actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthActions).mockReturnValue({ signIn, signOut, isAuthAvailable: true });
  });

  it('uses the shared sign-in action without forwarding the click event', async () => {
    const { user } = setup({ login: true });

    await user.click(screen.getByRole('button', { name: 'global-login' }));

    expect(signIn).toHaveBeenCalledExactlyOnceWith();
    expect(signOut).not.toHaveBeenCalled();
  });

  it('uses the shared sign-out action without overriding the default redirect', async () => {
    const { user } = setup({ logout: true });

    await user.click(screen.getByRole('button', { name: 'global-logout' }));

    expect(signOut).toHaveBeenCalledExactlyOnceWith();
    expect(signIn).not.toHaveBeenCalled();
  });

  it.each([{ login: true }, { logout: true }])('hides unavailable auth actions: %j', (props) => {
    vi.mocked(useAuthActions).mockReturnValue({ signIn, signOut, isAuthAvailable: false });
    setup(props);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
