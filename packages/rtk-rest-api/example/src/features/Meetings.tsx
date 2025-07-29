// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Event, isTimelessEvent } from '@opentalk/rest-api-rtk-query';
import React from 'react';

import { useGetEventsQuery } from '../endpoints/events';
import AddMeeting from './AddMeeting';

/**
 * Renders a single Meeting display card
 * @param {meeting: Event}
 */
export const MeetingArticle = ({ meeting }: { meeting: Event }) => {
  return (
    <article>
      <h2>{meeting.title || 'No Title Given'}</h2>
      <p>
        Created by: <span translate="no">{meeting.createdBy?.displayName || 'John doe'}</span>
      </p>
      {!isTimelessEvent(meeting) && (
        <p>
          {new Date(meeting.startsAt?.datetime).toDateString()} - {new Date(meeting.endsAt?.datetime).toDateString()}
        </p>
      )}
      {meeting.description && <p>{meeting.description}</p>}
      <a href={'#' + meeting.room?.id}>Join Room</a>
    </article>
  );
};

const Meetings = () => {
  const { data: events, isLoading } = useGetEventsQuery({});
  return (
    <div>
      <AddMeeting />
      {events?.data?.map((meeting) => (
        <MeetingArticle key={meeting.title} meeting={meeting as Event} />
      ))}
      {isLoading && <span>Loading ...</span>}
    </div>
  );
};

export default Meetings;
