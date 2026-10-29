// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { AuthContext } from '@opentalk/redux-oidc';
import { act, renderHook, waitFor } from '@testing-library/react';
import { Provider as ReduxProvider } from 'react-redux';

import log from '../logger';
import { navigateTo } from '../utils/navigation';
import { configureStore } from '../utils/testUtils';
import { SWITCH_ACCOUNT_STORAGE_KEY, useSwitchAccount } from './useSwitchAccount';

vi.mock('../utils/navigation', () => ({ navigateTo: vi.fn() }));

const setup = ({ isLoggedIn, signInError }: { isLoggedIn: boolean; signInError?: Error }) => {
  const { store } = configureStore({
    initialState: { auth: { state: isLoggedIn ? 'authorized' : 'anonymous' } },
  });
  const signIn = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
  if (signInError) {
    signIn.mockRejectedValue(signInError);
  }
  const signOut = vi.fn();

  const { result, unmount } = renderHook(() => useSwitchAccount(), {
    wrapper: ({ children }) => (
      <ReduxProvider store={store}>
        <AuthContext.Provider value={{ signIn, signOut } as never}>{children}</AuthContext.Provider>
      </ReduxProvider>
    ),
  });

  return { result, unmount, signIn, signOut };
};

describe('useSwitchAccount', () => {
  beforeEach(() => {
    sessionStorage.clear();
    window.history.replaceState({}, '', '/room/room-id?foo=bar');
  });

  afterEach(() => {
    sessionStorage.removeItem(SWITCH_ACCOUNT_STORAGE_KEY);
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('marks the account switch and signs out returning to the current page', () => {
    const { result, signOut, signIn } = setup({ isLoggedIn: true });

    act(() => result.current.switchAccount());

    expect(sessionStorage.getItem(SWITCH_ACCOUNT_STORAGE_KEY)).toBe('true');
    expect(signOut).toHaveBeenCalledExactlyOnceWith(`${window.location.origin}/room/room-id?foo=bar`);
    expect(signIn).not.toHaveBeenCalled();
  });

  it('starts the sign in returning to the current page once signed out', () => {
    sessionStorage.setItem(SWITCH_ACCOUNT_STORAGE_KEY, 'true');
    const { result, signIn } = setup({ isLoggedIn: false });

    expect(result.current.isSwitchingAccount).toBe(true);
    expect(signIn).toHaveBeenCalledExactlyOnceWith();
  });

  it('consumes the switch marker across remounts without signing in again on a later guest visit', () => {
    const signedIn = setup({ isLoggedIn: true });

    act(() => signedIn.result.current.switchAccount());

    expect(signedIn.signOut).toHaveBeenCalledExactlyOnceWith(window.location.href);
    expect(signedIn.signIn).not.toHaveBeenCalled();
    signedIn.unmount();

    expect(sessionStorage.getItem(SWITCH_ACCOUNT_STORAGE_KEY)).toBe('true');

    const signedOut = setup({ isLoggedIn: false });

    expect(signedOut.result.current.isSwitchingAccount).toBe(true);
    expect(signedOut.signIn).toHaveBeenCalledExactlyOnceWith();
    expect(sessionStorage.getItem(SWITCH_ACCOUNT_STORAGE_KEY)).toBeNull();
    signedOut.unmount();

    const afterSignIn = setup({ isLoggedIn: true });

    expect(afterSignIn.result.current.isSwitchingAccount).toBe(false);
    expect(afterSignIn.signIn).not.toHaveBeenCalled();
    afterSignIn.unmount();

    const laterGuestVisit = setup({ isLoggedIn: false });

    expect(laterGuestVisit.result.current.isSwitchingAccount).toBe(false);
    expect(laterGuestVisit.signIn).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(SWITCH_ACCOUNT_STORAGE_KEY)).toBeNull();
  });

  it('redirects on failed account switching without unblocking the guest lobby', async () => {
    const error = new Error('unavailable');
    const logError = vi.spyOn(log, 'error').mockImplementation(() => undefined);
    sessionStorage.setItem(SWITCH_ACCOUNT_STORAGE_KEY, 'true');
    const { result } = setup({ isLoggedIn: false, signInError: error });

    await waitFor(() => expect(navigateTo).toHaveBeenCalledExactlyOnceWith('/server-issue'));
    expect(logError).toHaveBeenCalledExactlyOnceWith('failed to signIn:', error);
    expect(result.current.isSwitchingAccount).toBe(true);
    expect(sessionStorage.getItem(SWITCH_ACCOUNT_STORAGE_KEY)).toBeNull();
  });

  it('does not start the sign in without the mark', () => {
    const { result, signIn } = setup({ isLoggedIn: false });

    expect(result.current.isSwitchingAccount).toBe(false);
    expect(signIn).not.toHaveBeenCalled();
  });

  it('does not start the sign in but removes a stale mark when already logged in', () => {
    sessionStorage.setItem(SWITCH_ACCOUNT_STORAGE_KEY, 'true');
    const { result, signIn } = setup({ isLoggedIn: true });

    expect(result.current.isSwitchingAccount).toBe(false);
    expect(signIn).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(SWITCH_ACCOUNT_STORAGE_KEY)).toBeNull();
  });

  it('starts the sign in returning to the current page without signing out', () => {
    const { result, signIn, signOut } = setup({ isLoggedIn: false });

    act(() => result.current.signIn());

    expect(signIn).toHaveBeenCalledExactlyOnceWith();
    expect(signOut).not.toHaveBeenCalled();
  });

  it('also redirects when signing in directly fails', async () => {
    const error = new Error('unavailable');
    const logError = vi.spyOn(log, 'error').mockImplementation(() => undefined);
    const { result, signOut } = setup({ isLoggedIn: false, signInError: error });

    act(() => result.current.signIn());

    await waitFor(() => expect(navigateTo).toHaveBeenCalledExactlyOnceWith('/server-issue'));
    expect(logError).toHaveBeenCalledExactlyOnceWith('failed to signIn:', error);
    expect(signOut).not.toHaveBeenCalled();
  });
});
