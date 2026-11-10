// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { AuthContextValues, useAuthContext } from '@opentalk/redux-oidc';

import log from '../logger';
import { navigateTo } from '../utils/navigation';

const handleSignInError = (error: unknown) => {
  log.error('failed to signIn:', error);
  navigateTo('/server-issue');
};

export const useAuthActions = () => {
  const auth = useAuthContext();

  const signIn = (...args: Parameters<AuthContextValues['signIn']>) => {
    auth?.signIn(...args).catch(handleSignInError);
  };

  const signOut = (...args: Parameters<AuthContextValues['signOut']>) => {
    auth?.signOut(...args);
  };

  return { signIn, signOut, isAuthAvailable: auth !== undefined };
};
