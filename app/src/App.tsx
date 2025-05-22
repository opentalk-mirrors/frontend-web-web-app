// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Provider as StoreProvider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';

import Provider from './Provider';
import Routes from './Routes';
import GlitchtipErrorDialog from './components/GlitchtipErrorDialog';
import AppErrorBoundary from './errorBoundaries/AppErrorBoundary';
import ErrorConfigPage from './pages/ErrorConfigPage';
import store from './store';
import { checkConfigError } from './utils/configUtils';

const App = () => {
  const hasConfigError = checkConfigError();
  if (hasConfigError) {
    return <ErrorConfigPage />;
  }

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
