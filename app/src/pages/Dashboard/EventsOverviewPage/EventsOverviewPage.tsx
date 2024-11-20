// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  CursorPaginated,
  DateTime,
  Event,
  EventException,
  InviteStatus,
  isTimelessEvent,
} from '@opentalk/rest-api-rtk-query';
import { formatRFC3339 } from 'date-fns';
import { groupBy } from 'lodash';
import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useGetEventsQuery } from '../../../api/rest';
import { useUpdateDocumentTitle } from '../../../hooks/useUpdateDocumentTitle';
import {
  appendRecurringEventInstances,
  SortDirection,
  orderEventsByDate,
  TimePerspectiveFilter,
} from '../../../utils/eventUtils';
import EventsOverview from './fragments/EventsOverview';
import EventsPageHeader from './fragments/EventsPageHeader';
import { filterByTimePeriod } from './fragments/utils';
import { DashboardEventsFilters, FilterChangeCallbackType, MeetingsProp, TimeFilter } from './types';

const EMPTY_MEETING_PROP_ARRAY: Array<MeetingsProp> = [];
const CachedEventsPageHeader = memo(EventsPageHeader);

const EVENTS_PER_REQUEST = 100;

const EventsOverviewPage = () => {
  const [expandAccordion, setExpandAccordion] = useState<string>('');
  const [filter, setFilter] = useState<DashboardEventsFilters>({
    timePeriod: TimeFilter.Month,
    timeMin: new Date().toTimeString() as DateTime,
    openInvitedMeeting: false,
    favoriteMeetings: false,
    timePerspective: TimePerspectiveFilter.TimeIndependent,
  });

  const { t } = useTranslation();
  const pageHeading = t('dashboard-events-my-meetings');
  useUpdateDocumentTitle(pageHeading);

  const formatEventsByHeaderChange = useCallback(
    (events: Array<Event>) => {
      if (filter.favoriteMeetings) {
        return events.filter((event) => event.isFavorite);
      }
      if (filter.openInvitedMeeting) {
        return events.filter((event) => event.inviteStatus !== InviteStatus.Accepted);
      }
      return events;
    },
    [filter.favoriteMeetings, filter.openInvitedMeeting]
  );

  const timeMinFilter = useMemo(() => {
    if (filter.timePerspective === TimePerspectiveFilter.Future) {
      // setSecond to 0 to optimize the request and not ask data on every second when switching timePeriodFilter
      return formatRFC3339(new Date().setSeconds(0, 0)) as DateTime;
    }
  }, [filter.timePerspective]);

  const timeMaxFilter = useMemo(() => {
    if (filter.timePerspective === TimePerspectiveFilter.Past) {
      // setSecond to 0 to optimize the request and not ask data on every second when switching timePeriodFilter
      return formatRFC3339(new Date().setSeconds(0, 0)) as DateTime;
    }
  }, [filter.timePerspective]);

  /**
   * Returns memoized function to optimize the performance (acts like a memoized selector)
   **/
  const selectAndTransformToMeetingProps = (
    data: CursorPaginated<Event | EventException> | undefined,
    timePerspectiveFilter: TimePerspectiveFilter
  ) =>
    useMemo(() => {
      if (!data) {
        return [];
      }

      const eventsWithEventInstances = appendRecurringEventInstances(data.data, true, undefined, timePerspectiveFilter);

      const orderedEventsWithRecurringInstances = orderEventsByDate(
        formatEventsByHeaderChange(eventsWithEventInstances),
        timePerspectiveFilter === TimePerspectiveFilter.Future ? SortDirection.ASC : SortDirection.DESC
      );

      if (timePerspectiveFilter === TimePerspectiveFilter.TimeIndependent) {
        const constructMeetingProp = {
          title: t('dashboard-meeting-details-page-timeindependent'),
          events: orderedEventsWithRecurringInstances,
        };
        setExpandAccordion('all');
        return [constructMeetingProp];
      }
      const eventsGroupedByTimeFilter = groupBy(orderedEventsWithRecurringInstances, (event) =>
        filterByTimePeriod(
          filter.timePeriod,
          isTimelessEvent(event) ? event.createdAt : (event.startsAt?.datetime as DateTime)
        )
      );
      const eventsTransformedAsMeetingProp = Object.entries(eventsGroupedByTimeFilter).map(([title, events]) => ({
        title,
        events,
      }));
      if (eventsTransformedAsMeetingProp.length > 0) {
        setExpandAccordion(eventsTransformedAsMeetingProp[0].title);
      }
      return [...eventsTransformedAsMeetingProp];
    }, [timePerspectiveFilter, filter, data]);

  const { events, isLoading, isFetching } = useGetEventsQuery(
    {
      favorites: filter.favoriteMeetings,
      perPage: EVENTS_PER_REQUEST,
      adhoc: false,
      timeIndependent: filter.timePerspective === TimePerspectiveFilter.TimeIndependent,
      timeMin: timeMinFilter,
      timeMax: timeMaxFilter,
    },
    {
      selectFromResult: ({ data, isLoading, isFetching }) => ({
        events: selectAndTransformToMeetingProps(data, filter.timePerspective),
        isLoading,
        isFetching,
      }),
    }
  );

  const onFilterChange: FilterChangeCallbackType = useCallback((key, value) => {
    setFilter((prevFilters) => ({ ...prevFilters, [key]: value ? value : !prevFilters[key] }));
  }, []);

  return (
    <>
      <CachedEventsPageHeader
        entries={events || EMPTY_MEETING_PROP_ARRAY}
        filters={filter}
        onFilterChange={onFilterChange}
        title={pageHeading}
      />
      <EventsOverview
        entries={events || EMPTY_MEETING_PROP_ARRAY}
        expandAccordion={expandAccordion}
        setExpandAccordion={setExpandAccordion}
        isLoading={isLoading}
        isFetching={isFetching}
      />
    </>
  );
};

export default EventsOverviewPage;
