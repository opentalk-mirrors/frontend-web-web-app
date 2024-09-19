// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { CssBaseline, StyledEngineProvider, ThemeProvider } from '@mui/material';
import { AuthProvider } from '@opentalk/redux-oidc';

import { createOpenTalkTheme } from './assets/themes/opentalk';
import { SnackbarProvider } from './commonComponents';
import { useAppSelector } from './hooks';
import BreakoutRoomProvider from './provider/BreakoutRoomProvider';
import FullscreenProvider from './provider/FullscreenProvider';
import MediaChoicesProvider from './provider/MediaChoicesProvider';
import { selectBaseUrl, selectControllerUrl, selectOidcConfig } from './store/slices/configSlice';
import { ConnectionState, selectRoomConnectionState } from './store/slices/roomSlice';

interface ProviderProps {
  children: React.ReactNode;
}

const Provider = ({ children }: ProviderProps) => {
  const oidcConfig = useAppSelector(selectOidcConfig);
  const baseUrl = useAppSelector(selectBaseUrl);
  const roomState = useAppSelector(selectRoomConnectionState);
  const inRoom = roomState === ConnectionState.Online || roomState === ConnectionState.Leaving;
  const controllerBasedUrl = useAppSelector(selectControllerUrl);

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
        <ThemeProvider theme={inRoom ? createOpenTalkTheme('dark') : createOpenTalkTheme()}>
          <CssBaseline />
          <BreakoutRoomProvider>
            <FullscreenProvider>
              <SnackbarProvider>
                <MediaChoicesProvider>{children}</MediaChoicesProvider>
              </SnackbarProvider>
            </FullscreenProvider>
          </BreakoutRoomProvider>
        </ThemeProvider>
      </AuthProvider>
    </StyledEngineProvider>
  );
};

export default Provider;
