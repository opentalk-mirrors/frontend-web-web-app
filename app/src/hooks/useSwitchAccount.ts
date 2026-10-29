// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { selectIsAuthenticated } from '@opentalk/redux-oidc';
import { useEffect, useState } from 'react';

import { useAuthActions } from './useAuthActions';
import { useAppSelector } from './useCustomRedux';

export const SWITCH_ACCOUNT_STORAGE_KEY = 'switch_account';

export const useSwitchAccount = () => {
  const { signIn, signOut, isAuthAvailable } = useAuthActions();
  const isLoggedIn = useAppSelector(selectIsAuthenticated);
  // Only read once, the flag is removed right away to not trigger another sign in on a later visit
  const [isSwitchingAccount] = useState(
    () => !isLoggedIn && sessionStorage.getItem(SWITCH_ACCOUNT_STORAGE_KEY) !== null
  );

  useEffect(() => {
    sessionStorage.removeItem(SWITCH_ACCOUNT_STORAGE_KEY);
  }, []);

  useEffect(() => {
    if (!isSwitchingAccount || !isAuthAvailable) {
      return;
    }
    signIn();
  }, [isSwitchingAccount, isAuthAvailable, signIn]);

  const switchAccount = () => {
    if (!isAuthAvailable) {
      return;
    }
    sessionStorage.setItem(SWITCH_ACCOUNT_STORAGE_KEY, 'true');
    signOut(window.location.href);
  };

  return { signIn: () => signIn(), switchAccount, isSwitchingAccount };
};
