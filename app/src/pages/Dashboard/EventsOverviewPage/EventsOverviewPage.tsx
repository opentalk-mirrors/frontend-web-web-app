// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { DateTime, InviteStatus, isTimelessEvent } from '@opentalk/rest-api-rtk-query';
import { formatRFC3339 } from 'date-fns';
import { groupBy } from 'lodash';
import { useCallback, useMemo, useState } from 'react';
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
const EVENTS_PER_REQUEST = 100;

const EventsOverviewPage = () => {
  const [expandAccordionOverride, setExpandAccordionOverride] = useState<string>('');
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

  const { favoriteMeetings, openInvitedMeeting, timePeriod, timePerspective } = filter;

  const timeMinFilter = useMemo(() => {
    if (timePerspective === TimePerspectiveFilter.Future) {
      // setSecond to 0 to optimize the request and not ask data on every second when switching timePeriodFilter
      return formatRFC3339(new Date().setSeconds(0, 0)) as DateTime;
    }
  }, [timePerspective]);

  const timeMaxFilter = useMemo(() => {
    if (timePerspective === TimePerspectiveFilter.Past) {
      // setSecond to 0 to optimize the request and not ask data on every second when switching timePeriodFilter
      return formatRFC3339(new Date().setSeconds(0, 0)) as DateTime;
    }
  }, [timePerspective]);

  const { data, isLoading, isFetching } = useGetEventsQuery({
    favorites: favoriteMeetings,
    perPage: EVENTS_PER_REQUEST,
    adhoc: false,
    timeIndependent: timePerspective === TimePerspectiveFilter.TimeIndependent,
    timeMin: timeMinFilter,
    timeMax: timeMaxFilter,
  });

  const events = useMemo<Array<MeetingsProp>>(() => {
    if (!data) {
      return EMPTY_MEETING_PROP_ARRAY;
    }

    const eventsWithEventInstances = appendRecurringEventInstances(data.data, true, undefined, timePerspective);

    let targetedEvents = eventsWithEventInstances;
    if (favoriteMeetings || openInvitedMeeting) {
      targetedEvents = eventsWithEventInstances.filter((event) => {
        if (favoriteMeetings) {
          return event.isFavorite;
        }
        return event.inviteStatus !== InviteStatus.Accepted;
      });
    }

    const orderedEventsWithRecurringInstances = orderEventsByDate(
      targetedEvents,
      timePerspective === TimePerspectiveFilter.Future ? SortDirection.ASC : SortDirection.DESC
    );

    if (timePerspective === TimePerspectiveFilter.TimeIndependent) {
      return [
        {
          title: t('dashboard-meeting-details-page-timeindependent'),
          events: orderedEventsWithRecurringInstances,
        },
      ];
    }

    const eventsGroupedByTimeFilter = groupBy(orderedEventsWithRecurringInstances, (event) =>
      filterByTimePeriod(timePeriod, isTimelessEvent(event) ? event.createdAt : (event.startsAt?.datetime as DateTime))
    );

    return Object.entries(eventsGroupedByTimeFilter).map(([title, groupedEvents]) => ({
      title,
      events: groupedEvents,
    }));
  }, [data, favoriteMeetings, openInvitedMeeting, timePeriod, timePerspective, t]);

  const defaultExpandAccordion = useMemo(() => {
    if (!events.length) {
      return '';
    }

    if (timePerspective === TimePerspectiveFilter.TimeIndependent) {
      return 'all';
    }

    return events[0].title;
  }, [events, timePerspective]);

  const expandAccordion = useMemo(() => {
    if (!expandAccordionOverride) {
      return defaultExpandAccordion;
    }

    if (expandAccordionOverride === 'all') {
      return 'all';
    }

    const hasMatchingEntry = events.some((entry) => entry.title === expandAccordionOverride);
    return hasMatchingEntry ? expandAccordionOverride : defaultExpandAccordion;
  }, [defaultExpandAccordion, events, expandAccordionOverride]);

  const onFilterChange: FilterChangeCallbackType = useCallback((key, value) => {
    setExpandAccordionOverride('');
    setFilter((prevFilters) => ({ ...prevFilters, [key]: value ? value : !prevFilters[key] }));
  }, []);

  return (
    <>
      <EventsPageHeader entries={events} filters={filter} onFilterChange={onFilterChange} title={pageHeading} />
      <EventsOverview
        entries={events}
        expandAccordion={expandAccordion}
        setExpandAccordion={setExpandAccordionOverride}
        isLoading={isLoading}
        isFetching={isFetching}
      />
    </>
  );
};

export default EventsOverviewPage;
