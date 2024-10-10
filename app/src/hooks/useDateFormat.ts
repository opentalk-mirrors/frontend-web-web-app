// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
// Hook for centralized time and date formatting.
// Please use it for time/date representation in your components.
// Currently the formats are fixed: 24h for time and system locale for date
// Later on can be adapted according to requirements.
import { Locale, isValid, format } from 'date-fns';

import useLocale from './useLocale';

type FormatOutput = 'date' | 'time' | 'attribute-date';

const getFormattedDate = (date: Date, locale: Locale | undefined) => {
  const formattedDate = format(date, 'P', { locale });
  return formattedDate;
};

const getFormattedTime = (date: Date) => {
  const formattedTime = format(date, 'HH:mm');
  return formattedTime;
};

const useDateFormat = (date: Date = new Date(), output: FormatOutput = 'date') => {
  const locale = useLocale();
  const validDate = isValid(date) ? date : new Date();
  let formattedTimestamp = '';

  switch (output) {
    case 'attribute-date':
      formattedTimestamp = format(validDate, 'yyyy-MM-dd');
      break;
    case 'date':
      formattedTimestamp = getFormattedDate(validDate, locale);
      break;
    case 'time':
      formattedTimestamp = getFormattedTime(validDate);
      break;
    default:
      formattedTimestamp = getFormattedDate(validDate, locale);
      break;
  }

  return formattedTimestamp;
};

export default useDateFormat;
