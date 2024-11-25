// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import i18next from 'i18next';
import { RouteObject, Outlet } from 'react-router-dom';

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
import ImprintPage from '../pages/ImprintPage';
import RoomPage from '../pages/RoomPage';
import SupportPage from '../pages/SupportPage';
import DashboardSettingsTemplate from '../templates/DashboardSettingsTemplate';
import DashboardTemplate from '../templates/DashboardTemplate';
import LobbyTemplate from '../templates/LobbyTemplate';
import {
  ProtectedRoute,
  Redirect,
  InvitePage,
  ExtendedTabPage,
  RouteNotFound,
  AuthRedirect,
} from './fragments/routesFragments';

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
    element: <LobbyTemplate />,
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
          { path: ':breakoutRoomId', element: <Redirect to="/room" />, key: 'breakoutRoom' },
        ],
      },
      {
        path: '/room/:roomId',
        key: 'room',
        element: <ProtectedRoute />,
        children: [
          { index: true, element: <RoomPage /> },
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
  /*
  Just disabled for now, we need this page later for the desktop. https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1877
  {
    path: '/join',
    element: <LobbyTemplate />,
    children: [{ index: true, element: <LandingPage /> }],
    key: 'join',
  }, */
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardTemplate />
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
        children: [
          { path: 'user-manual', element: <UserManualPage /> },
          { path: 'support', element: <SupportPage /> },
        ],
      },
    ],
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
