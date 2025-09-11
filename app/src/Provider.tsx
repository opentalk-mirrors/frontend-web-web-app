// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { CssBaseline, StyledEngineProvider, ThemeProvider } from '@mui/material';
import { AuthProvider } from '@opentalk/redux-oidc';
import { useLocation } from 'react-router-dom';

import { useGetColorSchemesQuery } from './api/rest';
import { createOpenTalkTheme } from './assets/themes/opentalk';
import { defaultDarkModeColors, defaultLightModeColors } from './assets/themes/opentalk/palette';
import { SnackbarProvider, SuspenseLoading } from './commonComponents';
import { useAppSelector } from './hooks';
import BreakoutRoomProvider from './provider/BreakoutRoomProvider';
import FullscreenProvider from './provider/FullscreenProvider';
import { selectBaseUrl, selectControllerUrl, selectOidcConfig } from './store/slices/configSlice';

interface ProviderProps {
  children: React.ReactNode;
}

const Provider = ({ children }: ProviderProps) => {
  const oidcConfig = useAppSelector(selectOidcConfig);
  const baseUrl = useAppSelector(selectBaseUrl);
  const controllerBasedUrl = useAppSelector(selectControllerUrl);
  const location = useLocation();
  const inDashboard = location.pathname.startsWith('/dashboard');

  const { isLoading, data } = useGetColorSchemesQuery({});

  const fallBackColorScheme = {
    light: defaultLightModeColors,
    dark: defaultDarkModeColors,
  };

  return (
    <StyledEngineProvider injectFirst>
      <AuthProvider
        configuration={{
          authority: oidcConfig.authority,
          clientId: oidcConfig.clientId,
          redirectUri: new URL(oidcConfig.redirectPath, baseUrl).toString(),
          scope: oidcConfig.scope,
          baseUrl: controllerBasedUrl,
          signOutRedirectUri: new URL(oidcConfig.signOutRedirectUri, baseUrl).toString(),
        }}
      >
        <ThemeProvider
          theme={createOpenTalkTheme(inDashboard ? 'light' : 'dark', data?.baseColorScheme || fallBackColorScheme)}
        >
          <CssBaseline />
          <BreakoutRoomProvider>
            <FullscreenProvider>
              <SnackbarProvider>{isLoading ? <SuspenseLoading /> : children}</SnackbarProvider>
            </FullscreenProvider>
          </BreakoutRoomProvider>
        </ThemeProvider>
      </AuthProvider>
    </StyledEngineProvider>
  );
};

export default Provider;
