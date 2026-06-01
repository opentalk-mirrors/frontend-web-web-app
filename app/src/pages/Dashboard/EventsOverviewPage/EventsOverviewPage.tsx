// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { DateTime, InviteStatus, isTimelessEvent } from '@opentalk/rest-api-rtk-query';
import { formatRFC3339 } from 'date-fns';
import { groupBy } from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useGetEventsWithInstancesQuery } from '../../../api/rest';
import { useUpdateDocumentTitle } from '../../../hooks/useUpdateDocumentTitle';
import { TimePerspectiveFilter } from '../../../utils/eventUtils';
import EventsOverview from './fragments/EventsOverview';
import EventsPageHeader from './fragments/EventsPageHeader';
import TimeIndependentOverview from './fragments/TimeIndependentOverview';
import { filterByTimePeriod } from './fragments/utils';
import { DashboardEventsFilters, FilterChangeCallbackType, MeetingsProp, TimeFilter } from './types';

const EMPTY_MEETING_PROP_ARRAY: Array<MeetingsProp> = [];
const EVENTS_PER_REQUEST = 100;
const MAX_INSTANCES_PER_RECURRING_EVENT = 100;

const EventsOverviewPage = () => {
  const [filter, setFilter] = useState<DashboardEventsFilters>({
    timePeriod: TimeFilter.Month,
    timeMin: new Date().toTimeString() as DateTime,
    openInvitedMeeting: false,
    favoriteMeetings: false,
    timePerspective: TimePerspectiveFilter.TimeIndependent,
    cursors: [],
    currentCursorIndex: -1,
  });

  const { t } = useTranslation();
  const pageHeading = t('dashboard-events-my-meetings');
  useUpdateDocumentTitle(pageHeading);

  const { favoriteMeetings, openInvitedMeeting, timePeriod, timePerspective, cursors, currentCursorIndex } = filter;

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

  const { groups, isLoading, isFetching } = useGetEventsWithInstancesQuery(
    {
      perPage: EVENTS_PER_REQUEST,
      instancesMax: MAX_INSTANCES_PER_RECURRING_EVENT,
      adhoc: false,
      timeIndependent: timePerspective === TimePerspectiveFilter.TimeIndependent,
      timeMin: timeMinFilter,
      timeMax: timeMaxFilter,
      after: cursors[currentCursorIndex],
    },
    {
      selectFromResult: ({ data, ...props }) => {
        if (!data) {
          return {
            groups: EMPTY_MEETING_PROP_ARRAY,
            ...props,
          };
        }

        let eventsWithEventInstances = data.data;

        if (favoriteMeetings || openInvitedMeeting) {
          eventsWithEventInstances = eventsWithEventInstances.filter((event) => {
            const isPendingInvite = openInvitedMeeting && event.inviteStatus !== InviteStatus.Accepted;
            const isMarkedAsFavourite = favoriteMeetings && event.isFavorite;

            return isPendingInvite || isMarkedAsFavourite;
          });
        }

        const orderedEventsWithInstances =
          timePerspective === TimePerspectiveFilter.Future
            ? eventsWithEventInstances
            : [...eventsWithEventInstances].reverse();

        if (timePerspective === TimePerspectiveFilter.TimeIndependent) {
          return {
            ...props,
            groups: [
              {
                title: t('dashboard-meeting-details-page-timeindependent'),
                events: orderedEventsWithInstances,
                before: data.before,
                after: data.after,
              } satisfies MeetingsProp,
            ],
          };
        }

        const eventsGroupedByTimeFilter = groupBy(orderedEventsWithInstances, (event) =>
          filterByTimePeriod(
            timePeriod,
            isTimelessEvent(event) ? event.createdAt : (event.startsAt?.datetime as DateTime)
          )
        );

        const groups = Object.entries(eventsGroupedByTimeFilter).map(
          ([title, groupedEvents]): MeetingsProp => ({
            title,
            events: groupedEvents,
          })
        );

        return {
          ...props,
          groups,
        };
      },
    }
  );

  const onFilterChange: FilterChangeCallbackType = useCallback((key, value) => {
    setFilter((prevFilters) => ({ ...prevFilters, [key]: value ? value : !prevFilters[key] }));
  }, []);

  const onNextPage = useCallback((after: string) => {
    setFilter((prev) => ({
      ...prev,
      cursors: prev.currentCursorIndex === prev.cursors.length - 1 ? [...prev.cursors, after] : prev.cursors,
      currentCursorIndex: prev.currentCursorIndex + 1,
    }));
  }, []);

  const onPreviousPage = useCallback(() => {
    setFilter((prev) => ({ ...prev, currentCursorIndex: prev.currentCursorIndex - 1 }));
  }, []);

  return (
    <>
      <EventsPageHeader entries={groups} filters={filter} onFilterChange={onFilterChange} title={pageHeading} />
      {groups.length !== 0 &&
        (timePerspective === TimePerspectiveFilter.TimeIndependent ? (
          <TimeIndependentOverview
            groups={groups}
            isFetching={isFetching}
            isLoading={isLoading}
            onNextPage={onNextPage}
            onPreviousPage={onPreviousPage}
            currentCursorIndex={currentCursorIndex}
          />
        ) : (
          <EventsOverview entries={groups} isLoading={isLoading} isFetching={isFetching} />
        ))}
    </>
  );
};

export default EventsOverviewPage;
