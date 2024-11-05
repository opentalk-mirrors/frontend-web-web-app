// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Locale } from 'date-fns';
import enUS from 'date-fns/locale/en-US/index.js';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function useLocale() {
  const { i18n } = useTranslation();
  const language = i18n.language.split('-')[0] as string;
  const [locale, setLocale] = useState<Locale | undefined>(undefined);

  const loadLocale = useCallback(
    async (abortController: AbortController) => {
      // en-US is the default and fallback locale
      let locale = enUS;

      // Dynamic imports shall be extendable for other languages in the future
      // https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2224
      if (language === 'de') {
        try {
          abortController.signal.throwIfAborted();
          locale = await import(`date-fns/locale/de/index.js`).then((module) => module.default);
          abortController.signal.throwIfAborted();
          return locale;
        } catch {
          return enUS;
        }
      }

      return locale;
    },
    [language]
  );

  useEffect(() => {
    const abortController = new AbortController();
    loadLocale(abortController).then((locale) => {
      if (!abortController.signal.aborted) {
        setLocale(locale);
      }
    });

    return function cleanup() {
      abortController.abort();
    };
  }, [loadLocale]);

  return locale;
}
