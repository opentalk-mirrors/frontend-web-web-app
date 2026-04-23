// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import 'context-filter-polyfill';
import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import './banner';
import { exposeDevTools } from './devTools';
import './glitchtip';
import './i18n';
import SplashScreenPage from './pages/SplashScreenPage';
import reportWebVitals from './reportWebVitals';

const container = document.getElementById('root');
const root = createRoot(container as HTMLElement);

exposeDevTools();

root.render(
  <StrictMode>
    <Suspense fallback={<SplashScreenPage />}>
      <App />
    </Suspense>
  </StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
