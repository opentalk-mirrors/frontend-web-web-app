// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { selectError } from '@opentalk/redux-oidc';
import { Suspense, useEffect } from 'react';
import { useNavigate, useRoutes } from 'react-router-dom';

import { ErrorCode } from './api/rest';
import { SuspenseLoading } from './commonComponents';
import BetaBadge from './components/BetaBadge';
import routeArray from './config/routes';
import { useAppSelector } from './hooks';
import { selectIsBetaRelease, selectOidcConfig } from './store/slices/configSlice';
import { setNavigator } from './utils/navigation';

const Routes = () => {
  const oidcConfig = useAppSelector(selectOidcConfig);
  const isBetaRelease = useAppSelector(selectIsBetaRelease);
  const error = useAppSelector(selectError);
  const routes = useRoutes(routeArray(oidcConfig.redirectPath, oidcConfig.popupRedirectPath));
  const nav = useNavigate();

  useEffect(() => {
    //Sets the navigator so it can be used outside of components (like in rest.ts)
    setNavigator(nav);
  }, [nav]);

  if (error && error.code === ErrorCode.InvalidClaims) {
    throw new Error(error.message as string, { cause: ErrorCode.InvalidClaims });
  }

  return (
    <Suspense fallback={<SuspenseLoading />}>
      {isBetaRelease && <BetaBadge />}
      {routes}
    </Suspense>
  );
};

export default Routes;
