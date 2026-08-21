// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
// SPDX-License-Identifier: EUPL-1.2
import { DateTime } from '@opentalk/rest-api-rtk-query';
import { endOfISOWeek, getWeek, startOfISOWeek } from 'date-fns';
import i18n, { t } from 'i18next';

import { localStorageItems } from '../../../../config/storage';
import { TimePerspectiveFilter } from '../../../../utils/eventUtils';
import { formatDate } from '../../../../utils/timeFormatUtils';
import { DashboardEventsFilters, TimeFilter } from '../types';

const DEFAULT_TIME_PERSPECTIVE = TimePerspectiveFilter.Future;
const DEFAULT_TIME_FILTER = TimeFilter.Month;

export const parseTimePerspective = (value: string | null): TimePerspectiveFilter =>
  Object.values(TimePerspectiveFilter).includes(value as TimePerspectiveFilter)
    ? (value as TimePerspectiveFilter)
    : DEFAULT_TIME_PERSPECTIVE;

export const parseTimePeriod = (value: string | null): TimeFilter =>
  Object.values(TimeFilter).includes(value as TimeFilter) ? (value as TimeFilter) : DEFAULT_TIME_FILTER;

export interface StoredMeetingsFilter {
  timePerspective: TimePerspectiveFilter;
  timePeriod: TimeFilter;
}

export const readStoredMeetingsFilter = (): StoredMeetingsFilter => {
  try {
    const raw = localStorage.getItem(localStorageItems.meetingsFilter);
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      timePerspective: parseTimePerspective(parsed?.timePerspective ?? null),
      timePeriod: parseTimePeriod(parsed?.timePeriod ?? null),
    };
  } catch {
    return { timePerspective: DEFAULT_TIME_PERSPECTIVE, timePeriod: DEFAULT_TIME_FILTER };
  }
};

export const writeStoredMeetingsFilter = (filter: StoredMeetingsFilter): void => {
  localStorage.setItem(localStorageItems.meetingsFilter, JSON.stringify(filter));
};

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
