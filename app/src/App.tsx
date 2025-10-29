// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useEffect } from 'react';
import { Provider as StoreProvider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';

import Provider from './Provider';
import Routes from './Routes';
import GlitchtipErrorDialog from './components/GlitchtipErrorDialog';
import AppErrorBoundary from './errorBoundaries/AppErrorBoundary';
import { setupGlitchtip } from './glitchtip';
import ErrorConfigPage from './pages/ErrorConfigPage';
import { setupStore } from './store';
import { ReduxDomEvents } from './store/slices/hotkeys/eventBindings';
import { checkConfigError } from './utils/configUtils';

const store = setupStore();

const App = () => {
  const hasConfigError = checkConfigError();

  useEffect(() => {
    if (hasConfigError) {
      return;
    }
    setupGlitchtip(store.dispatch);
    ReduxDomEvents.createInstance(store.dispatch);
  }, [hasConfigError]);

  if (hasConfigError) {
    return <ErrorConfigPage />;
  }

  return (
    <Router basename={new URL(window.config.baseUrl).pathname}>
      <StoreProvider store={store}>
        <Provider>
          <AppErrorBoundary>
            <GlitchtipErrorDialog />
            <Routes />
          </AppErrorBoundary>
        </Provider>
      </StoreProvider>
    </Router>
  );
};

export default App;
