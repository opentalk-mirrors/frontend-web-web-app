// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
// SPDX-License-Identifier: EUPL-1.2
import { DateTime } from '@opentalk/rest-api-rtk-query';
import { endOfISOWeek, getWeek, startOfISOWeek } from 'date-fns';
import i18n, { t } from 'i18next';

import { formatDate } from '../../../../utils/timeFormatUtils';
import { DashboardEventsFilters, TimeFilter } from '../types';

export const filterByTimePeriod = (timePeriod: DashboardEventsFilters['timePeriod'], date: DateTime) => {
  const createDate = new Date(date);

  switch (timePeriod) {
    case TimeFilter.Month:
      return new Intl.DateTimeFormat(i18n.language, { month: 'long', year: 'numeric' }).format(createDate);
    case TimeFilter.Day:
      return new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' }).format(
        createDate
      );
    case TimeFilter.Week:
    default: {
      //Gets the week number with weeks starting on a Monday (1) as ISO standard, since every first week contains a Thursday (4)
      const weekNumber = getWeek(createDate, { weekStartsOn: 1, firstWeekContainsDate: 4 });

      const startDate = formatDate(startOfISOWeek(createDate)).getDateString();
      const endDate = formatDate(endOfISOWeek(createDate)).getDateString();

      return `${t('global-calendar-week')}: ${weekNumber} (${startDate} - ${endDate})`;
    }
  }
};
