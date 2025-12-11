// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { AuthCallbackComponent, selectAuthIsPending } from '@opentalk/redux-oidc';
import { selectIsAuthenticated, useAuthContext } from '@opentalk/redux-oidc';
import React, { PropsWithChildren, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, To, useLocation, useNavigate, useParams } from 'react-router-dom';

import Error from '../../components/Error';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { useInviteCode } from '../../hooks/useInviteCode';
import log from '../../logger';
import { selectUiMode, setUiMode, UiMode } from '../../store/slices/uiSlice';
import { navigateTo } from '../../utils/navigation';

export const InvitePage = React.lazy(() => import('../../pages/InvitePage'));
export const ExtendedTabPage = React.lazy(() => import('../../pages/ExtendedTabPage'));

type ProtectedRouteProps = PropsWithChildren;

export const AuthRedirect = ({ label }: { label: string }) => {
  return (
    <AuthCallbackComponent>
      <p>{label}</p>
    </AuthCallbackComponent>
  );
};

export const RouteNotFound = () => {
  const { t } = useTranslation();
  return <Error title={t('route-not-found')} />;
};

export const Redirect = ({ to }: { to: To }) => {
  const navigate = useNavigate();
  const { roomId } = useParams();

  useEffect(() => {
    roomId ? navigate(`${to}/${roomId}`) : navigate(to);
  }, [navigate, to, roomId]);
  return null;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const auth = useAuthContext();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAuthPending = useAppSelector(selectAuthIsPending);
  const inviteCode = useInviteCode();

  if (isAuthPending) {
    return null;
  }

  if (!isAuthenticated && !inviteCode) {
    auth?.signIn().catch((error) => {
      log.error('failed to signIn:', error);
      navigateTo('server-issue');
    });
    return null;
  }

  if (children !== undefined) {
    return <>{children}</>;
  }
  return <Outlet />;
};

export const RouteUiMode = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const uiMode = useAppSelector(selectUiMode);
  const dispatch = useAppDispatch();
  useEffect(() => {
    const path = location.pathname;
    if (path.includes(UiMode.Dashboard) && uiMode !== UiMode.Dashboard) {
      dispatch(setUiMode(UiMode.Dashboard));
    }
    if (path.includes(UiMode.Room) && uiMode !== UiMode.Room) {
      dispatch(setUiMode(UiMode.Room));
    }
  }, [dispatch, location.pathname, uiMode]);

  if (children !== undefined) {
    return <>{children}</>;
  }
  return <Outlet />;
};
