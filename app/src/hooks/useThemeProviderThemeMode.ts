// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { selectIsAuthenticated } from '@opentalk/redux-oidc';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { useGetMeQuery } from '../api/rest';
import { ThemeMode } from '../assets/themes/opentalk/types';
import { getBroadcastChannel } from '../modules/BroadcastChannel';
import { useAppSelector } from './useCustomRedux';

export function useThemeProviderThemeMode(): ThemeMode.Light | ThemeMode.Dark {
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { data, isLoading, refetch } = useGetMeQuery(undefined, { skip: !isAuthenticated });
  const inDashboard = location.pathname.startsWith('/dashboard');

  const [systemTheme, setSystemTheme] = useState<ThemeMode.Dark | ThemeMode.Light>(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? ThemeMode.Dark : ThemeMode.Light;
  });

  useEffect(() => {
    const listener = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? ThemeMode.Dark : ThemeMode.Light);
    };

    const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQueryList.addEventListener('change', listener);

    return function cleanup() {
      mediaQueryList.removeEventListener('change', listener);
    };
  }, []);

  useEffect(() => {
    const listener = (event: MessageEvent) => event.data.type === 'sync' && refetch();
    const channel = getBroadcastChannel('settings_general');
    if (channel) {
      channel.addEventListener('message', listener);
      return function cleanup() {
        channel.removeEventListener('message', listener);
      };
    }
  }, [refetch]);

  if (isLoading || !data) {
    return inDashboard ? ThemeMode.Light : ThemeMode.Dark;
  }

  if (inDashboard && data.dashboardTheme === null) {
    return ThemeMode.Light;
  }

  if (!inDashboard && data.conferenceTheme === null) {
    return ThemeMode.Dark;
  }

  if (inDashboard && data.dashboardTheme === 'system') {
    return systemTheme;
  }

  if (!inDashboard && data.conferenceTheme === 'system') {
    return systemTheme;
  }

  if (inDashboard) {
    return data.dashboardTheme === 'light' ? ThemeMode.Light : ThemeMode.Dark;
  }

  return data.conferenceTheme === 'light' ? ThemeMode.Light : ThemeMode.Dark;
}
