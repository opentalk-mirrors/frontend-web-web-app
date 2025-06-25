// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import * as Sentry from '@sentry/browser';

import i18n from './i18n';
import store from './store';
import { setShowErrorDialog } from './store/slices/uiSlice';

if (window.config.glitchtip && window.config.glitchtip.dsn) {
  Sentry.setTags({
    'release.productVersion': window.config.version?.product,
    instance: window.location.origin,
    locale: i18n.language,
  });
  Sentry.init({
    dsn: window.config.glitchtip.dsn,
    enabled: Boolean(window.config.glitchtip.dsn),
    release: window.config.version?.frontend,
    beforeSend: (event) => {
      if (event.exception && event.event_id) {
        store.dispatch(setShowErrorDialog({ showErrorDialog: true, event }));
      }
      return null;
    },
  });
  i18n.on('languageChanged', (lng) => {
    Sentry.setTag('locale', lng);
  });
}
