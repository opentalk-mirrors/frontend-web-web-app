import { createContext, useContext } from 'react';

import { AuthAdapterConfiguration, AuthenticationProviderUrls } from './authAdapter';

export const AuthContext = createContext<AuthContextValues | undefined>(undefined);
export interface AuthContextValues {
  configuration: AuthAdapterConfiguration;
  signIn: (redirectUrl?: string, codeChallenge?: string) => Promise<void>;
  signOut: (signOutRedirectUrl?: string) => void;
  openidConfig?: AuthenticationProviderUrls;
  getBaseUrl: () => string;
  getSavedRedirectUrl: () => string | undefined;
  getNewRefreshToken: () => void;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
