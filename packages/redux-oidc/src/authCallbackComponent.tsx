import { isEmpty } from 'lodash';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useAuthContext } from './authContext';
import { selectAuthIsPending, selectIsAuthenticated, getAppDispatch, codeCallback } from './store';

export interface AuthCallbackContext {
  children?: ReactNode[] | ReactNode;
  redirectUrl?: string;
}
const AuthCallbackComponent = ({ children, redirectUrl = '/' }: AuthCallbackContext) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const auth = useAuthContext();
  const dispatch = getAppDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAuthPending = useSelector(selectAuthIsPending);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const codeVerifier = sessionStorage.getItem('code_verifier');
    const savedState = sessionStorage.getItem('oidc_state_parameter');

    const isOidcStateVerified = savedState && !isEmpty(savedState) && savedState === state;
    const isCodeVerifierAvaliable = codeVerifier && !isEmpty(codeVerifier);

    if (!auth || !auth.openidConfig) {
      return;
    }

    if (!code || !isOidcStateVerified || !isCodeVerifierAvaliable) {
      auth.signIn(window.location.href);
      return;
    }

    const clientId = auth.configuration.clientId;
    const baseUrl = auth.getBaseUrl();
    /**
     * Once user is back from sign in provider
     * get the code from the auth provider and call codeCallback to get access tokens
     */

    dispatch(
      codeCallback({
        clientId,
        redirectUri: auth.configuration.redirectUri,
        tokenEndpoint: auth.openidConfig.tokenEndpoint,
        baseUrl,
        code,
      })
    );

    sessionStorage.removeItem('oidc_state_parameter');
  }, [auth]);

  useEffect(() => {
    if (isAuthenticated && !isAuthPending) {
      navigate(auth?.getSavedRedirectUrl() || redirectUrl);
    }
  }, [isAuthenticated, isAuthPending]);

  return <>{children}</>;
};

export default AuthCallbackComponent;
