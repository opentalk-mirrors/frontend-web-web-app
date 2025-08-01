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
    // Prevents react from calling the dispatch while the component is remounting - https://react.dev/learn/synchronizing-with-effects#fetching-data
    let ignore = false;
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
        if (!ignore) {
          dispatch(
            codeCallback({
              clientId,
              redirectUri: auth.configuration.redirectUri,
              tokenEndpoint: config.tokenEndpoint,
              baseUrl,
              code,
            })
          );
        }
      });
    }

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated && !isAuthPending) {
      navigate(auth?.getSavedRedirectUrl() || redirectUrl);
    }
  }, [isAuthenticated, isAuthPending]);

  return <>{children}</>;
};

export default AuthCallbackComponent;
