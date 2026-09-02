// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { DateTime } from '@opentalk/rest-api-rtk-query';

import { TimePerspectiveFilter } from '../../../utils/eventUtils';
import { eventMockedData } from '../../../utils/testUtils';
import {
  filterByTimePeriod,
  parseTimePeriod,
  parseTimePerspective,
  readStoredMeetingsFilter,
  writeStoredMeetingsFilter,
} from './fragments/utils';
import { TimeFilter } from './types';

const createMockEvent = () => ({
  title: 'some title',
  events: [{ ...eventMockedData }],
});

vi.mock('../../../api/rest', async (importOriginal) => ({
  ...(await importOriginal()),
  useGetEventsQuery: () => ({
    isLoading: false,
    events: [createMockEvent()],
    isFetching: false,
  }),
  useGetMeQuery: () => ({
    data: {
      id: '3645d74d-9a4b-4cd4-9d9f-f1871c970167',
    },
  }),
}));

vi.mock('../../../templates/DashboardTemplate', () => ({
  useHeader: () => ({
    setHeader: vi.fn(),
  }),
}));

describe('Unit test filterByTimePeriod function used for grouping the events by timePeriod', () => {
  it('returns month on month filtering', () => {
    expect(filterByTimePeriod(TimeFilter.Month, '2022-04-06T13:57:38.793602Z' as DateTime)).toBe('April 2022');
  });

  it('returns month on day filtering', () => {
    expect(filterByTimePeriod(TimeFilter.Day, '2022-04-06T13:57:38.793602Z' as DateTime)).toBe('April 6, 2022');
  });

  it('returns week on week filtering', () => {
    expect(filterByTimePeriod(TimeFilter.Week, '2022-04-06T13:57:38.793602Z' as DateTime)).toBe(
      'global-calendar-week: 14 (04/04/2022 - 04/10/2022)'
    );
  });
});

describe('parseTimePerspective for reading the time perspective filter', () => {
  it('returns the matching perspective for a valid value', () => {
    expect(parseTimePerspective('future')).toBe(TimePerspectiveFilter.Future);
    expect(parseTimePerspective('past')).toBe(TimePerspectiveFilter.Past);
    expect(parseTimePerspective('timeindependent')).toBe(TimePerspectiveFilter.TimeIndependent);
  });

  it('defaults to time independent for missing or invalid values', () => {
    expect(parseTimePerspective(null)).toBe(TimePerspectiveFilter.Future);
    expect(parseTimePerspective('bogus')).toBe(TimePerspectiveFilter.Future);
  });
});

describe('parseTimePeriod for reading the time period filter', () => {
  it('returns the matching period for a valid value', () => {
    expect(parseTimePeriod('month')).toBe(TimeFilter.Month);
    expect(parseTimePeriod('week')).toBe(TimeFilter.Week);
    expect(parseTimePeriod('day')).toBe(TimeFilter.Day);
  });

  it('defaults to month for missing or invalid values', () => {
    expect(parseTimePeriod(null)).toBe(TimeFilter.Month);
    expect(parseTimePeriod('bogus')).toBe(TimeFilter.Month);
  });
});

describe('readStoredMeetingsFilter / writeStoredMeetingsFilter for persisting the filter as a user preference', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('defaults to time independent + month when nothing is stored', () => {
    expect(readStoredMeetingsFilter()).toEqual({
      timePerspective: TimePerspectiveFilter.Future,
      timePeriod: TimeFilter.Month,
    });
  });

  it('round-trips a written filter', () => {
    writeStoredMeetingsFilter({ timePerspective: TimePerspectiveFilter.Future, timePeriod: TimeFilter.Week });
    expect(readStoredMeetingsFilter()).toEqual({
      timePerspective: TimePerspectiveFilter.Future,
      timePeriod: TimeFilter.Week,
    });
  });

  it('falls back to defaults for corrupted or invalid stored values', () => {
    localStorage.setItem('dashboard-meetings-filter', 'not json');
    expect(readStoredMeetingsFilter()).toEqual({
      timePerspective: TimePerspectiveFilter.Future,
      timePeriod: TimeFilter.Month,
    });

    localStorage.setItem('dashboard-meetings-filter', JSON.stringify({ timePerspective: 'abc', timePeriod: 'abc' }));
    expect(readStoredMeetingsFilter()).toEqual({
      timePerspective: TimePerspectiveFilter.Future,
      timePeriod: TimeFilter.Month,
    });
  });
});
