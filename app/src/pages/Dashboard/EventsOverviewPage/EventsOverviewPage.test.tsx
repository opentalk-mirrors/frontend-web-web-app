// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { DateTime } from '@opentalk/rest-api-rtk-query';
import { screen, cleanup } from '@testing-library/react';

import { configureStore, renderWithProviders, eventMockedData } from '../../../utils/testUtils';
import EventsPage from './EventsOverviewPage';
import { TimeFilter } from './fragments/EventsPageHeader';
import { filterByTimePeriod } from './fragments/utils';

const createMockEvent = () => ({
  title: 'some title',
  events: [{ ...eventMockedData }],
});

jest.mock('../../../api/rest', () => ({
  ...jest.requireActual('../../../api/rest'),
  useGetEventsQuery: () => ({
    isLoading: false,
    events: [createMockEvent()],
    isFatching: false,
  }),
  useGetMeQuery: () => ({
    data: {
      id: '3645d74d-9a4b-4cd4-9d9f-f1871c970167',
    },
  }),
}));

jest.mock('../../../templates/DashboardTemplate', () => ({
  useHeader: () => ({
    setHeader: jest.fn(),
  }),
}));

describe('Dashboard EventsPage', () => {
  afterEach(() => cleanup());

  it('will render 1 Accordion', () => {
    const { store } = configureStore();
    renderWithProviders(<EventsPage />, { store, provider: { mui: true, router: true } });

    expect(screen.getByTestId('EventAccordion')).toBeInTheDocument();
    expect(screen.getAllByTestId('EventAccordion')).toHaveLength(1);
  });
});

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
