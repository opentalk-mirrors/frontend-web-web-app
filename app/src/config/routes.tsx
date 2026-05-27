// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import i18next from 'i18next';
import { RouteObject, Outlet } from 'react-router-dom';

import Error from '../components/Error';
import {
  SettingsProfilePage,
  SettingsGeneralPage,
  SettingsAccountPage,
  SettingsStoragePage,
  CreateEventsPage,
  EditEventsPage,
  Home,
  CreateDirectMeeting,
  EventsOverviewPage,
  EventDetailsPage,
  UserManualPage,
} from '../pages/Dashboard';
import DataProtectionPage from '../pages/DataProtectionPage';
import ExtendedTabPage from '../pages/ExtendedTabPage';
import ImprintPage from '../pages/ImprintPage';
import InvitePage from '../pages/InvitePage';
import RoomPage from '../pages/RoomPage';
import SupportPage from '../pages/SupportPage';
import DashboardSettingsTemplate from '../templates/DashboardSettingsTemplate';
import DashboardTemplate from '../templates/DashboardTemplate';
import LobbyTemplate from '../templates/LobbyTemplate';
import { ProtectedRoute, Redirect, RouteNotFound, AuthRedirect, RouteUiMode } from './fragments/routesFragments';

type RouteValue = {
  path: string;
  children?: Routes;
};

export type Routes = {
  [key: string]: RouteValue;
};

type CreateRoutes = (redirectUri: string, popUpRedirect: string) => RouteObject[];

const routes: CreateRoutes = (redirectUri: string, popUpRedirect: string) => [
  {
    path: '/',
    key: 'home',
    element: (
      <RouteUiMode>
        <LobbyTemplate />
      </RouteUiMode>
    ),
    children: [
      { index: true, element: <Redirect to="/dashboard" /> },
      {
        path: '/lobby/:roomId',
        key: 'lobby',
        element: <Redirect to="/room" />,
      },
      {
        path: '/waiting/:roomId',
        key: 'waiting',
        element: <ProtectedRoute />,
        children: [
          { index: true, element: <Redirect to="/room" /> },
          // Kept for backwards compatibility with old invite links that included a breakout room ID in the path (ignored).
          { path: ':breakoutRoomId', element: <Redirect to="/room" />, key: 'breakoutRoom' },
        ],
      },
      {
        path: '/room/:roomId',
        key: 'room',
        element: <ProtectedRoute />,
        children: [
          { index: true, element: <RoomPage /> },
          // Kept for backwards compatibility with old invite links that included a breakout room ID in the path (ignored).
          { path: ':breakoutRoomId', element: <RoomPage />, key: 'breakoutRoom' },
        ],
      },
      {
        path: '/room/extended/:channelId',
        key: 'room',
        element: <ExtendedTabPage />,
      },
    ],
  },

  {
    path: '/invite/:inviteCode',
    element: <LobbyTemplate />,
    children: [{ index: true, element: <InvitePage /> }],
    key: 'invite',
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <RouteUiMode>
          <DashboardTemplate />
        </RouteUiMode>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'settings',
        element: <DashboardSettingsTemplate />,
        children: [
          { path: 'general', element: <SettingsGeneralPage /> },
          { path: 'account', element: <SettingsAccountPage /> },
          { path: 'profile', element: <SettingsProfilePage /> },
          { path: 'storage', element: <SettingsStoragePage /> },
        ],
      },
      {
        path: 'legal',
        element: (
          <>
            <Outlet />
          </>
        ),
        children: [
          { path: 'imprint', element: <ImprintPage /> },
          { path: 'data-protection', element: <DataProtectionPage /> },
        ],
      },
      {
        path: 'meetings',
        children: [
          { element: <EventsOverviewPage />, index: true },
          { path: 'meet-now', element: <CreateDirectMeeting /> },
          { path: 'create', element: <CreateEventsPage /> },
          { path: 'update/:eventId/:formStep', element: <EditEventsPage /> },
          { path: ':eventId', element: <EventDetailsPage /> },
        ],
      },
      {
        path: 'help',
        element: <Outlet />,
        children: [
          { path: 'user-manual', element: <UserManualPage /> },
          { path: 'support', element: <SupportPage /> },
        ],
      },
    ],
  },
  {
    path: 'server-issue',
    element: (
      <Error
        title={i18next.t('server-issue-page-title')}
        description={i18next.t('server-issue-page-description')}
        retry
      />
    ),
  },
  {
    path: redirectUri,
    key: 'redirectUri',
    element: <AuthRedirect label={i18next.t('auth-redirect-message')} />,
  },
  {
    path: popUpRedirect,
    key: 'popUpRedirect',
    element: <AuthRedirect label={i18next.t('auth-popup-closes-message')} />,
  },
  {
    path: '*',
    element: <RouteNotFound />,
  },
];

export default routes;
