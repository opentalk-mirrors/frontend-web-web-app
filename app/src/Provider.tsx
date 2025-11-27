// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { CssBaseline, StyledEngineProvider, ThemeProvider } from '@mui/material';
import { AuthProvider } from '@opentalk/redux-oidc';

import { useGetColorSchemesQuery } from './api/rest';
import { createOpenTalkTheme } from './assets/themes/opentalk';
import { defaultDarkModeColors, defaultLightModeColors } from './assets/themes/opentalk/palette';
import { SnackbarProvider, SuspenseLoading } from './commonComponents';
import { useAppSelector } from './hooks';
import { useThemeProviderThemeMode } from './hooks/useThemeProviderThemeMode';
import BreakoutRoomProvider from './provider/BreakoutRoomProvider';
import { selectBaseUrl, selectControllerUrl, selectOidcConfig } from './store/slices/configSlice';

interface ProviderProps {
  children: React.ReactNode;
}

const Provider = ({ children }: ProviderProps) => {
  const oidcConfig = useAppSelector(selectOidcConfig);
  const baseUrl = useAppSelector(selectBaseUrl);
  const controllerBasedUrl = useAppSelector(selectControllerUrl);

  const { isLoading, data } = useGetColorSchemesQuery({});
  const mode = useThemeProviderThemeMode();

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
        <ThemeProvider theme={createOpenTalkTheme(mode, data?.baseColorScheme || fallBackColorScheme)}>
          <CssBaseline />
          <BreakoutRoomProvider>
            <SnackbarProvider>{isLoading ? <SuspenseLoading /> : children}</SnackbarProvider>
          </BreakoutRoomProvider>
        </ThemeProvider>
      </AuthProvider>
    </StyledEngineProvider>
  );
};

export default Provider;
