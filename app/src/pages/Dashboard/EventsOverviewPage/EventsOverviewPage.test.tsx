// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { DateTime } from '@opentalk/rest-api-rtk-query';

import { eventMockedData } from '../../../utils/testUtils';
import { filterByTimePeriod } from './fragments/utils';
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
