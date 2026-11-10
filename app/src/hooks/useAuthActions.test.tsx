// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { AuthContext, AuthContextValues } from '@opentalk/redux-oidc';
import { act, renderHook, waitFor } from '@testing-library/react';

import log from '../logger';
import { navigateTo } from '../utils/navigation';
import { useAuthActions } from './useAuthActions';

vi.mock('../utils/navigation', () => ({ navigateTo: vi.fn() }));

const setup = () => {
  const auth = {
    configuration: {
      authority: 'https://auth.example',
      clientId: 'frontend',
      redirectUri: 'https://app.example/auth/callback',
      scope: 'openid',
      baseUrl: 'https://app.example',
      signOutRedirectUri: 'https://app.example/dashboard',
    },
    signIn: vi.fn<AuthContextValues['signIn']>().mockResolvedValue(undefined),
    signOut: vi.fn<AuthContextValues['signOut']>(),
    getBaseUrl: vi.fn(() => 'https://app.example'),
    getSavedRedirectUrl: vi.fn(() => undefined),
    getNewRefreshToken: vi.fn(),
  } satisfies AuthContextValues;

  const { result } = renderHook(() => useAuthActions(), {
    wrapper: ({ children }) => <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>,
  });

  return { auth, result };
};

describe('useAuthActions', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('reports whether the auth provider is available', () => {
    const { result } = setup();
    expect(result.current.isAuthAvailable).toBe(true);

    const { result: withoutProvider } = renderHook(() => useAuthActions());
    expect(withoutProvider.current.isAuthAvailable).toBe(false);
  });

  it('signs in without overriding the current-page redirect', () => {
    const { auth, result } = setup();

    act(() => result.current.signIn());

    expect(auth.signIn).toHaveBeenCalledExactlyOnceWith();
    expect(auth.signOut).not.toHaveBeenCalled();
    expect(navigateTo).not.toHaveBeenCalled();
  });

  it('forwards an explicit sign-in redirect', () => {
    const { auth, result } = setup();

    act(() => result.current.signIn('/room/room-id?foo=bar'));

    expect(auth.signIn).toHaveBeenCalledExactlyOnceWith('/room/room-id?foo=bar');
  });

  it('logs failed sign-in and redirects to the server error page', async () => {
    const { auth, result } = setup();
    const error = new Error('Sign-in unavailable');
    const logError = vi.spyOn(log, 'error').mockImplementation(() => undefined);
    auth.signIn.mockRejectedValueOnce(error);

    act(() => result.current.signIn('/room/room-id'));

    await waitFor(() => expect(navigateTo).toHaveBeenCalledExactlyOnceWith('/server-issue'));
    expect(logError).toHaveBeenCalledExactlyOnceWith('failed to signIn:', error);
    expect(auth.signOut).not.toHaveBeenCalled();
  });

  it('signs out using the default redirect when none is provided', () => {
    const { auth, result } = setup();

    act(() => result.current.signOut());

    expect(auth.signOut).toHaveBeenCalledExactlyOnceWith();
    expect(auth.signIn).not.toHaveBeenCalled();
  });

  it('forwards the post-logout redirect unchanged', () => {
    const { auth, result } = setup();
    const redirectUrl = 'https://app.example/room/room-id?foo=bar';

    act(() => result.current.signOut(redirectUrl));

    expect(auth.signOut).toHaveBeenCalledExactlyOnceWith(redirectUrl);
  });
});
