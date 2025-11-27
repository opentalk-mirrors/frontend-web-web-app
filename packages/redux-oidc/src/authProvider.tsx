import { FC, PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { AuthAdapter, AuthAdapterConfiguration, AuthenticationProviderUrls } from './authAdapter';
import { AuthContext } from './authContext';
import { getNewToken } from './store';
import {
  selectError,
  selectIsAuthenticated,
  selectIsRefreshTokenLoading,
  selectLoginTimestamp,
  selectRefreshError,
  startLoading,
  getAppDispatch,
} from './store';
import { AuthTypeError, calculateTokenRenewalTime, getSavedLocation, hasValidToken } from './utils';

export interface AuthProviderValues {
  configuration: AuthAdapterConfiguration;
}

const AuthProvider: FC<PropsWithChildren<AuthProviderValues>> = ({ children, configuration }) => {
  const dispatch = getAppDispatch();
  const authAdapter = AuthAdapter.getInstance(configuration);
  const isRefreshAuthError = useSelector(selectRefreshError);
  const isAuthError = useSelector(selectError);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loginTimestamp = useSelector(selectLoginTimestamp);
  const isRefreshTokenLoading = useSelector(selectIsRefreshTokenLoading);
  const [openidConfig, setOpenidConfig] = useState<AuthenticationProviderUrls>();

  // default is window.location.href
  const signIn = useCallback(
    async (redirectUrl?: string): Promise<void> => {
      return authAdapter.startOidcSignIn(redirectUrl);
    },
    [authAdapter]
  );

  const signOut = useCallback(
    (signOutRedirectUrl?: string) => {
      authAdapter.signOut(signOutRedirectUrl);
    },
    [authAdapter]
  );

  const getBaseUrl = () => authAdapter.getBaseUrl();
  const getSavedRedirectUrl = () => getSavedLocation();

  const getNewRefreshToken = useCallback(() => {
    authAdapter.getConfigurationEndpoints().then((config) => {
      dispatch(
        getNewToken({
          clientId: configuration.clientId,
          tokenEndpoint: config.tokenEndpoint,
          baseUrl: configuration.baseUrl,
        })
      );
    });
  }, [authAdapter, configuration.baseUrl, configuration.clientId, dispatch]);

  useEffect(() => {
    authAdapter.getConfigurationEndpoints().then((res) => setOpenidConfig(res));
  }, [authAdapter]);
  /**
   * When authenticated:
   * 1. If access token is not valid get immediately new one and put loading state to true
   * 2. If access token is valid set interval for getting new one
   */
  useEffect(() => {
    if (isAuthenticated) {
      if (isRefreshTokenLoading) {
        return;
      }
      const accessToken = authAdapter.getAccessToken();
      if (!hasValidToken(accessToken)) {
        // We manually dispatch startLoading from here, because user is already authenticated, but token is not automatically refetched
        // (probably because user closed the app in the meantime or connection issues occurred)
        // The UI needs to waits until new token is requested.
        dispatch(startLoading());
        getNewRefreshToken();
      } else {
        const renewalTokenInterval = calculateTokenRenewalTime(accessToken as string);
        const tokenInterval = setInterval(() => {
          getNewRefreshToken();
        }, renewalTokenInterval);
        return () => {
          clearInterval(tokenInterval);
        };
      }
    }
  }, [authAdapter, dispatch, getNewRefreshToken, isAuthenticated, isRefreshTokenLoading, loginTimestamp]);

  // ERROR handling
  useEffect(() => {
    if (isRefreshTokenLoading) {
      return;
    }
    if (isRefreshAuthError) {
      signOut(window.location.href);
    }
    if (isAuthError && isAuthError.name === AuthTypeError.SessionExpired) {
      getNewRefreshToken();
    }
  }, [getNewRefreshToken, isAuthError, isRefreshAuthError, isRefreshTokenLoading, signOut]);

  return (
    <AuthContext.Provider
      value={{
        configuration,
        signIn,
        signOut,
        openidConfig,
        getBaseUrl,
        getSavedRedirectUrl,
        getNewRefreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
