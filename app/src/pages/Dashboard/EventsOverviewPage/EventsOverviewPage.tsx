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
  const [expandAccordion, setExpandAccordion] = useState<string[]>([]);
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

  const { events, isLoading, isFetching } = useGetEventsQuery(
    {
      favorites: favoriteMeetings,
      perPage: EVENTS_PER_REQUEST,
      adhoc: false,
      timeIndependent: timePerspective === TimePerspectiveFilter.TimeIndependent,
      timeMin: timeMinFilter,
      timeMax: timeMaxFilter,
    },
    {
      selectFromResult: ({ data, ...props }) => {
        if (!data) {
          return {
            events: EMPTY_MEETING_PROP_ARRAY,
            ...props,
          };
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
          return {
            ...props,
            events: [
              {
                title: t('dashboard-meeting-details-page-timeindependent'),
                events: orderedEventsWithRecurringInstances,
              },
            ],
          };
        }

        const eventsGroupedByTimeFilter = groupBy(orderedEventsWithRecurringInstances, (event) =>
          filterByTimePeriod(
            timePeriod,
            isTimelessEvent(event) ? event.createdAt : (event.startsAt?.datetime as DateTime)
          )
        );

        const events = Object.entries(eventsGroupedByTimeFilter).map(([title, groupedEvents]) => ({
          title,
          events: groupedEvents,
        }));

        return {
          ...props,
          events,
        };
      },
    }
  );

  const onFilterChange: FilterChangeCallbackType = useCallback((key, value) => {
    setFilter((prevFilters) => ({ ...prevFilters, [key]: value ? value : !prevFilters[key] }));
  }, []);

  return (
    <>
      <EventsPageHeader entries={events} filters={filter} onFilterChange={onFilterChange} title={pageHeading} />
      <EventsOverview
        entries={events}
        expandAccordion={expandAccordion}
        setExpandAccordion={setExpandAccordion}
        isLoading={isLoading}
        isFetching={isFetching}
      />
    </>
  );
};

export default EventsOverviewPage;
