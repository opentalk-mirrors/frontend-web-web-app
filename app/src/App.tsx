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

const App = () => {
  const hasConfigError = checkConfigError();
  const store = setupStore();

  if (hasConfigError) {
    return <ErrorConfigPage />;
  }

  useEffect(() => {
    setupGlitchtip(store.dispatch);
    ReduxDomEvents.createInstance(store.dispatch);
  }, []);

  return (
    <Router basename={new URL(window.config.baseUrl).pathname}>
      <StoreProvider store={store}>
        <AppErrorBoundary>
          <Provider>
            <GlitchtipErrorDialog />
            <Routes />
          </Provider>
        </AppErrorBoundary>
      </StoreProvider>
    </Router>
  );
};

export default App;
