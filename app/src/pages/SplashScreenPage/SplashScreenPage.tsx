// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ThemeProvider } from '@mui/material';

import { createOpenTalkTheme } from '../../assets/themes/opentalk';
import { defaultDarkModeColors, defaultLightModeColors } from '../../assets/themes/opentalk/palette';
import SuspenseLoading from '../../commonComponents/SuspenseLoading/SuspenseLoading';

const bootstrapTheme = createOpenTalkTheme('light', {
  light: defaultLightModeColors,
  dark: defaultDarkModeColors,
});

const SplashScreenPage = () => (
  <ThemeProvider theme={bootstrapTheme}>
    <div className="loading-container">
      <SuspenseLoading size="64px" color="secondary" />
    </div>
  </ThemeProvider>
);

export default SplashScreenPage;
