// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { LocalizationProvider, LocalizationProviderProps } from '@mui/x-date-pickers';
import { deDE, enUS } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Locale } from 'date-fns';
import deLocale from 'date-fns/locale/de';
import enLocale from 'date-fns/locale/en-US';
import { useTranslation } from 'react-i18next';

const dateLocaleMap = new Map([
  ['en', enLocale],
  ['de', deLocale],
]);

const langLocaleMap = new Map([
  ['en', enUS.components.MuiLocalizationProvider.defaultProps.localeText],
  ['de', deDE.components.MuiLocalizationProvider.defaultProps.localeText],
]);

export interface DateTimeProviderProps extends LocalizationProviderProps<Date, Locale> {
  children: React.ReactNode;
}

const PickerLocalizationProvider = (props: DateTimeProviderProps) => {
  const { children, localeText } = props;
  const { i18n } = useTranslation();
  const language = i18n.language.split('-')[0];
  const dateLocale = dateLocaleMap.get(language);
  const defaultLocaleText = langLocaleMap.get(language);

  // Parent can provide customized translation for a particular element
  const finalLocaleText = { ...defaultLocaleText, ...localeText };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={dateLocale} localeText={finalLocaleText}>
      {children}
    </LocalizationProvider>
  );
};

export default PickerLocalizationProvider;
