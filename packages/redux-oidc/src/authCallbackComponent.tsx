import { isEmpty } from 'lodash';
import { ReactNode, useEffect } from 'react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useAuthContext } from './authProvider';
import { selectIsAuthenticated, selectAuthIsPending } from './store';
import { codeCallback } from './store/authActions';

export interface AuthCallbackContext {
  children?: ReactNode[] | ReactNode;
  redirectUrl?: string;
}
const AuthCallbackComponent = ({ children, redirectUrl = '/' }: AuthCallbackContext) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const auth = useAuthContext();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAuthPending = useSelector(selectAuthIsPending);

  useEffect(() => {
    const code = searchParams.get('code');
    if (code && auth) {
      const codeVerifier = sessionStorage.getItem('code_verifier');
      if (isEmpty(codeVerifier)) {
        auth.signIn('/dashboard');
        return;
      }
      const clientId = auth.configuration.clientId;
      const baseUrl = auth?.getBaseUrl();
      /**
       * Once user is back from sign in provider
       * get the code from the auth provider and call codeCallback to get access tokens
       */
      auth.getConfigurationEndpoints().then((config) => {
        dispatch(
          codeCallback({
            clientId,
            redirectUri: auth.configuration.redirectUri,
            tokenEndpoint: config.tokenEndpoint,
            baseUrl,
            code,
          })
        );
      });
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && !isAuthPending) {
      navigate(auth?.getSavedRedirectUrl() || redirectUrl);
    }
  }, [isAuthenticated, isAuthPending]);

  return <>{children}</>;
};

export default AuthCallbackComponent;
