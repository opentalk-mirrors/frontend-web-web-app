// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Stack, Skeleton, List, ListItem, styled } from '@mui/material';
import { DateTime, Event, EventException } from '@opentalk/rest-api-rtk-query';
import { formatRFC3339 } from 'date-fns';
import { isEmpty } from 'lodash';

import { useGetEventsQuery } from '../../../../api/rest';
import MeetingCard from '../../../../components/MeetingCard';
import { appendRecurringEventInstances, TimePerspectiveFilter } from '../../../../utils/eventUtils';

const MAX_MEETINGS_PER_PAGE = 4;
const MAX_CONSIDERED_MONTHS = 12;

const MeetingList = styled(List)({
  width: '100%',
  overflow: 'auto',
});

const CurrentMeetings = () => {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const { data: upcomingEvents, isLoading: upcomingEventsIsLoading } = useGetEventsQuery({
    timeMin: formatRFC3339(currentDate) as DateTime,
    perPage: MAX_MEETINGS_PER_PAGE,
    adhoc: false,
  });

  const { data: timeIndependentEvents, isLoading: timeIndependentEventsIsLoading } = useGetEventsQuery({
    perPage: MAX_MEETINGS_PER_PAGE,
    adhoc: false,
    timeIndependent: true,
  });

  if (upcomingEventsIsLoading || timeIndependentEventsIsLoading) {
    return (
      <Stack spacing={2}>
        <Skeleton variant="rectangular" height={130} />
        <Skeleton variant="rectangular" height={130} />
        <Skeleton variant="rectangular" height={130} />
        <Skeleton variant="rectangular" height={130} />
      </Stack>
    );
  }

  if (isEmpty(timeIndependentEvents?.data) && isEmpty(upcomingEvents?.data)) {
    return undefined;
  }

  const renderEvent = (event: Event | EventException) => {
    let startsAt = '';
    if (!event.isTimeIndependent && event.startsAt) {
      startsAt = event.startsAt.datetime;
    }
    return (
      <ListItem key={`${event.id}${startsAt}`} disableGutters>
        <MeetingCard event={event} />
      </ListItem>
    );
  };

  if (timeIndependentEvents?.data) {
    let tiEvents = Array.from(timeIndependentEvents.data);
    if (upcomingEvents?.data) {
      const ucEvents = Array.from(upcomingEvents.data);
      const expandedEvents = appendRecurringEventInstances(
        ucEvents,
        true,
        MAX_CONSIDERED_MONTHS,
        TimePerspectiveFilter.Future
      );
      tiEvents = tiEvents.concat(expandedEvents.slice(0, MAX_MEETINGS_PER_PAGE - tiEvents.length));
    }
    return <MeetingList>{tiEvents.map(renderEvent)}</MeetingList>;
  }

  return <MeetingList>{upcomingEvents?.data.map(renderEvent)}</MeetingList>;
};

export default CurrentMeetings;
