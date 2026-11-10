// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { logout, SessionStatus } from '@opentalk/redux-oidc';
import { act, screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import { useAuthActions } from '../../hooks/useAuthActions';
import { configureStore, renderWithProviders } from '../../utils/testUtils';
import { ProtectedRoute } from './routesFragments';

vi.mock('../../hooks/useAuthActions', () => ({ useAuthActions: vi.fn() }));

const signIn = vi.fn();
const signOut = vi.fn();

const setup = (state: SessionStatus, allowGuests = false) => {
  const { store } = configureStore({ initialState: { auth: { state } } });
  renderWithProviders(
    <ProtectedRoute allowGuests={allowGuests}>
      <div>Protected content</div>
    </ProtectedRoute>,
    { store, provider: { router: true } }
  );
  return { store };
};

describe('ProtectedRoute auth actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthActions).mockReturnValue({ signIn, signOut, isAuthAvailable: true });
  });

  it('starts sign-in through the shared action for an anonymous user', () => {
    setup(SessionStatus.ANONYMOUS);

    expect(signIn).toHaveBeenCalledExactlyOnceWith();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('lets guests access guest-enabled routes without signing in', () => {
    setup(SessionStatus.ANONYMOUS, true);

    expect(screen.getByText('Protected content')).toBeInTheDocument();
    expect(signIn).not.toHaveBeenCalled();
  });

  it('renders content for authenticated users without signing in again', () => {
    setup(SessionStatus.AUTHORIZED);

    expect(screen.getByText('Protected content')).toBeInTheDocument();
    expect(signIn).not.toHaveBeenCalled();
  });

  it('waits for pending authentication before starting sign-in', () => {
    const { store } = setup(SessionStatus.PENDING);

    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
    expect(signIn).not.toHaveBeenCalled();

    act(() => {
      store.dispatch(logout());
    });

    expect(signIn).toHaveBeenCalledExactlyOnceWith();
  });

  it('does not start sign-in when the auth provider is unavailable', () => {
    vi.mocked(useAuthActions).mockReturnValue({ signIn, signOut, isAuthAvailable: false });
    setup(SessionStatus.ANONYMOUS);

    expect(signIn).not.toHaveBeenCalled();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('renders the outlet when no explicit children are passed', () => {
    const { store } = configureStore({ initialState: { auth: { state: SessionStatus.AUTHORIZED } } });
    renderWithProviders(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<div>Nested content</div>} />
        </Route>
      </Routes>,
      { store, provider: { router: true } }
    );

    expect(screen.getByText('Nested content')).toBeInTheDocument();
    expect(signIn).not.toHaveBeenCalled();
  });
});
