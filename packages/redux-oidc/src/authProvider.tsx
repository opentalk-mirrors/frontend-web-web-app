import { FC, PropsWithChildren, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { AuthAdapter, AuthAdapterConfiguration } from './authAdapter';
import { AuthContext } from './authContext';
import { getNewToken } from './store/authActions';
import {
  selectError,
  selectIsAuthenticated,
  selectIsRefreshTokenLoading,
  selectLoginTimestamp,
  selectRefreshError,
  startLoading,
  getAppDispatch,
} from './store/authSlice';
import { AuthTypeError, calculateTokenRenewalTime, hasValidToken, pkceChallenge } from './utils';

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
  const isRefresTokenLoading = useSelector(selectIsRefreshTokenLoading);

  // default is window.location.href
  const signIn = async (redirectUrl?: string): Promise<void> => {
    const codeChallenge = await pkceChallenge.generate();
    return authAdapter.startOidcSignIn(redirectUrl, codeChallenge);
  };

  const signOut = (signOutRedirectUrl?: string) => {
    authAdapter.signOut(signOutRedirectUrl);
  };

  const getConfigurationEndpoints = () => authAdapter.getConfigurationEndpoints();
  const getBaseUrl = () => authAdapter.getBaseUrl();
  const getSavedRedirectUrl = () => authAdapter.getSavedLocation();

  const getNewRefreshToken = () => {
    getConfigurationEndpoints().then((config) => {
      dispatch(
        getNewToken({
          clientId: configuration.clientId,
          tokenEndpoint: config.tokenEndpoint,
          baseUrl: configuration.baseUrl,
        })
      );
    });
  };

  /**
   * When authenticated:
   * 1. If access token is not valid get immediatly new one and put loading state to true
   * 2. If access token is valid set interval for getting new one
   */
  useEffect(() => {
    if (isAuthenticated) {
      if (isRefresTokenLoading) {
        return;
      }
      const accessToken = authAdapter.getAccessToken();
      if (!hasValidToken(accessToken)) {
        // We manualy dispatch startLoading from here, because user is already authenticated, but token is not automaticly refetched
        // (probably because user closed the app in the meantime or connection issues occured)
        // The UI needs to waits untill new token is requested.
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
  }, [isAuthenticated, loginTimestamp]);

  // ERROR handling
  useEffect(() => {
    if (isRefresTokenLoading) {
      return;
    }
    if (isRefreshAuthError) {
      signOut(window.location.href);
    }
    if (isAuthError && isAuthError.name === AuthTypeError.SessionExpired) {
      getNewRefreshToken();
    }
  }, [isRefreshAuthError, isAuthError]);

  return (
    <AuthContext.Provider
      value={{
        configuration,
        signIn,
        signOut,
        getConfigurationEndpoints,
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
