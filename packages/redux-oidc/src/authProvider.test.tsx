// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { act, render, waitFor } from '@testing-library/react';
import { useSelector } from 'react-redux';
import { Mock, vi } from 'vitest';

import { AuthAdapter, type AuthAdapterConfiguration, type AuthenticationProviderUrls } from './authAdapter';
import { AuthContext, type AuthContextValues } from './authContext';
import AuthProvider from './authProvider';
import { getAppDispatch, getNewToken, saveLocationRedirect, startLoading, type AuthState } from './store';
import { AuthTypeError, SessionStatus, calculateTokenRenewalTime, hasValidToken, type SerializedError } from './utils';

const DEFAULT_LOGIN_TIMESTAMP = '2024-01-01T00:00:00.000Z';

vi.mock('react-redux', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('react-redux');
  return {
    ...actual,
    useSelector: vi.fn(),
  };
});

vi.mock('./store', async () => {
  const actual = await vi.importActual<typeof import('./store')>('./store');
  return {
    ...actual,
    getAppDispatch: vi.fn(),
    getNewToken: vi.fn(),
    startLoading: vi.fn(),
  };
});

vi.mock('./utils', async () => {
  const actual = await vi.importActual<typeof import('./utils')>('./utils');
  return {
    ...actual,
    hasValidToken: vi.fn(),
    calculateTokenRenewalTime: vi.fn(),
  };
});

describe('AuthProvider', () => {
  const configuration: AuthAdapterConfiguration = {
    authority: 'https://authority.example',
    clientId: 'client-id',
    redirectUri: 'https://app.example/callback',
    scope: 'openid profile',
    baseUrl: 'https://api.example',
    signOutRedirectUri: 'https://app.example/signout',
  };

  const oidcConfiguration: AuthenticationProviderUrls = {
    authorizationEndpoint: 'https://authority.example/auth',
    endSessionEndpoint: 'https://authority.example/logout',
    revocationEndpoint: 'https://authority.example/revoke',
    tokenEndpoint: 'https://authority.example/token',
    userInfoEndpoint: 'https://authority.example/userinfo',
  };

  const useSelectorMock = useSelector as unknown as Mock;
  const getAppDispatchMock = getAppDispatch as unknown as Mock;
  const getNewTokenMock = getNewToken as unknown as Mock;
  const startLoadingMock = startLoading as unknown as Mock;
  const hasValidTokenMock = hasValidToken as unknown as Mock;
  const calculateTokenRenewalTimeMock = calculateTokenRenewalTime as unknown as Mock;
  const getInstanceSpy = vi.spyOn(AuthAdapter, 'getInstance');

  type AdapterMock = {
    getConfigurationEndpoints: Mock;
    startOidcSignIn: Mock;
    signOut: Mock;
    getBaseUrl: Mock;
    getSavedLocation: Mock;
    getAccessToken: Mock;
  };

  let dispatch: Mock;

  const flushMicrotasks = async () => {
    await act(async () => {
      await Promise.resolve();
    });
  };

  const setAuthState = (overrides: Partial<AuthState> = {}) => {
    const state: { auth: AuthState } = {
      auth: {
        state: SessionStatus.ANONYMOUS,
        loginTimestamp: undefined,
        refreshTokenLoading: false,
        loading: false,
        error: undefined,
        ...overrides,
      },
    };

    useSelectorMock.mockImplementation((selector: (state: { auth: AuthState }) => unknown) => selector(state));
  };

  const createAdapterMock = (overrides: Partial<AdapterMock> = {}): AdapterMock => ({
    getConfigurationEndpoints: vi.fn().mockResolvedValue(oidcConfiguration),
    startOidcSignIn: vi.fn(),
    signOut: vi.fn(),
    getBaseUrl: vi.fn().mockReturnValue(configuration.baseUrl),
    getSavedLocation: vi.fn().mockReturnValue('/saved'),
    getAccessToken: vi.fn(),
    ...overrides,
  });

  const renderProvider = () => {
    let contextValue: AuthContextValues | undefined;

    const utils = render(
      <AuthProvider configuration={configuration}>
        <AuthContext.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    return { ...utils, getContext: () => contextValue };
  };

  beforeEach(() => {
    dispatch = vi.fn();
    vi.useRealTimers();
    vi.resetAllMocks();
    getAppDispatchMock.mockReturnValue(dispatch);
    getNewTokenMock.mockImplementation((payload) => ({ type: 'getNewToken', payload }));
    startLoadingMock.mockImplementation(() => ({ type: 'startLoading' }));
  });

  it('exposes context helpers and loads provider configuration', async () => {
    setAuthState();
    const adapter = createAdapterMock();
    getInstanceSpy.mockReturnValue(adapter as unknown as AuthAdapter);

    const { getContext } = renderProvider();
    await waitFor(() => expect(adapter.getConfigurationEndpoints).toHaveBeenCalled());
    await waitFor(() => expect(getContext()).toBeDefined());

    const context = getContext() as AuthContextValues;

    expect(context.configuration).toEqual(configuration);
    await waitFor(() => expect(context.openidConfig).toEqual(oidcConfiguration));

    await context.signIn('/dashboard');
    expect(dispatch).toHaveBeenCalledWith({
      type: 'auth/saveLocationRedirect',
      payload: '/dashboard',
    });
    context.signOut('/bye');
    dispatch(saveLocationRedirect('/saved'));
    expect(adapter.signOut).toHaveBeenCalledWith('/bye');
    expect(context.getBaseUrl()).toBe(configuration.baseUrl);
    expect(dispatch).toHaveBeenCalledWith({
      type: 'auth/saveLocationRedirect',
      payload: '/saved',
    });

    context.getNewRefreshToken();
    await waitFor(() =>
      expect(getNewTokenMock).toHaveBeenCalledWith({
        clientId: configuration.clientId,
        tokenEndpoint: oidcConfiguration.tokenEndpoint,
        baseUrl: configuration.baseUrl,
      })
    );
    expect(dispatch).toHaveBeenCalledWith({
      type: 'getNewToken',
      payload: {
        clientId: configuration.clientId,
        tokenEndpoint: oidcConfiguration.tokenEndpoint,
        baseUrl: configuration.baseUrl,
      },
    });
  });

  it('requests a new token when the user is authenticated with an invalid access token', async () => {
    setAuthState({
      state: SessionStatus.AUTHORIZED,
      loginTimestamp: DEFAULT_LOGIN_TIMESTAMP,
      refreshTokenLoading: false,
    });
    const adapter = createAdapterMock({ getAccessToken: vi.fn().mockReturnValue('expired-token') });
    getInstanceSpy.mockReturnValue(adapter as unknown as AuthAdapter);
    hasValidTokenMock.mockReturnValue(false);

    renderProvider();

    await waitFor(() => expect(hasValidTokenMock).toHaveBeenCalledWith('expired-token'));
    expect(startLoadingMock).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({ type: 'startLoading' });

    await waitFor(() =>
      expect(getNewTokenMock).toHaveBeenCalledWith({
        clientId: configuration.clientId,
        tokenEndpoint: oidcConfiguration.tokenEndpoint,
        baseUrl: configuration.baseUrl,
      })
    );
    expect(dispatch).toHaveBeenCalledWith({
      type: 'getNewToken',
      payload: {
        clientId: configuration.clientId,
        tokenEndpoint: oidcConfiguration.tokenEndpoint,
        baseUrl: configuration.baseUrl,
      },
    });
  });

  it('schedules token renewal while the access token is valid and clears the interval on unmount', async () => {
    vi.useFakeTimers();
    setAuthState({
      state: SessionStatus.AUTHORIZED,
      loginTimestamp: DEFAULT_LOGIN_TIMESTAMP,
      refreshTokenLoading: false,
    });
    const adapter = createAdapterMock({ getAccessToken: vi.fn().mockReturnValue('valid-token') });
    getInstanceSpy.mockReturnValue(adapter as unknown as AuthAdapter);
    hasValidTokenMock.mockReturnValue(true);
    calculateTokenRenewalTimeMock.mockReturnValue(1000);

    const { unmount } = renderProvider();

    await flushMicrotasks();
    expect(calculateTokenRenewalTimeMock).toHaveBeenCalledWith('valid-token');
    expect(startLoadingMock).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    await flushMicrotasks();
    await flushMicrotasks();
    expect(getNewTokenMock).toHaveBeenCalledTimes(1);
    const dispatchCallsWhileMounted = dispatch.mock.calls.length;

    unmount();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    await flushMicrotasks();
    await flushMicrotasks();

    expect(getNewTokenMock).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledTimes(dispatchCallsWhileMounted);
  });

  it('signs out when the refresh token flow fails', async () => {
    setAuthState({
      error: { name: AuthTypeError.RefreshTokenFailed } as SerializedError,
      refreshTokenLoading: false,
    });
    const adapter = createAdapterMock();
    getInstanceSpy.mockReturnValue(adapter as unknown as AuthAdapter);

    renderProvider();

    await waitFor(() => expect(adapter.signOut).toHaveBeenCalledWith(window.location.href));
  });

  it('requests a new refresh token when the session expired error is reported', async () => {
    setAuthState({
      error: { name: AuthTypeError.SessionExpired } as SerializedError,
      refreshTokenLoading: false,
    });
    const adapter = createAdapterMock();
    getInstanceSpy.mockReturnValue(adapter as unknown as AuthAdapter);

    renderProvider();

    await waitFor(() =>
      expect(getNewTokenMock).toHaveBeenCalledWith({
        clientId: configuration.clientId,
        tokenEndpoint: oidcConfiguration.tokenEndpoint,
        baseUrl: configuration.baseUrl,
      })
    );
  });
});
