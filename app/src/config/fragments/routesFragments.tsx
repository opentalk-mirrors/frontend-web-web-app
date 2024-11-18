// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { AuthCallbackComponent, selectAuthIsPending } from '@opentalk/redux-oidc';
import { useAuthContext, selectIsAuthenticated } from '@opentalk/redux-oidc';
import i18next from 'i18next';
import React, { PropsWithChildren, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { To, useNavigate, Outlet, useParams } from 'react-router-dom';

import { notifications } from '../../commonComponents';
import Error from '../../components/Error';
import { useAppSelector } from '../../hooks';
import { useInviteCode } from '../../hooks/useInviteCode';

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
      console.error('failed to signIn:', error);
      notifications.error(i18next.t('error-general'));
    });
    return null;
  }

  if (children !== undefined) {
    return <>{children}</>;
  }
  return <Outlet />;
};
