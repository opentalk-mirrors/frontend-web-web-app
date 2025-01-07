// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ftl2jsParse } from '@opentalk/fluent_conv';
import Fluent from '@opentalk/i18next-fluent';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

// don't want to use this?
// have a look at the Quick start guide
// for passing in lng and translations on init

i18n
  .use(HttpApi)
  .use(Fluent)
  .use(LanguageDetector)
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    fallbackLng: 'en',
    supportedLngs: ['de', 'en'],
    nonExplicitSupportedLngs: true,
    ns: ['k3k'],
    defaultNS: 'k3k',
    debug: false,
    detection: {
      // removed  'localStorage', 'sessionStorage' to prevent false language detection
      order: ['querystring', 'cookie', 'navigator', 'htmlTag'],
      caches: ['cookie'],
    },
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    backend: {
      loadPath: `${window.location.protocol}//${window.location.host}/locales/{{lng}}/{{ns}}.ftl`,
      parse: (data) => {
        return ftl2jsParse(data);
      },
      crossDomain: false,
    },
    react: {
      useSuspense: true,
    },
    returnObjects: true,
  });

i18n.loadNamespaces('k3k');
window.i18n = i18n;

i18n.on('languageChanged', function (nextLanguage) {
  document.documentElement.setAttribute('lang', nextLanguage);
});

i18n.on('loaded', function () {
  //document.documentElement.setAttribute('lang', i18n.language);
});

if (import.meta.hot) {
  import.meta.hot.on('locales-update', () => {
    i18n.reloadResources().then(() => {
      i18n.changeLanguage(i18n.language);
    });
  });
}

export default i18n;
