// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { BaseQueryFn, FetchArgs, FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/query';
import snakeCaseKeys from 'snakecase-keys';

import { Tag, Tags, UserId, CursorPaginated, DateTime } from '../types/common';
import {
  UpdateEventPayload,
  RescheduleEventPayload,
  EventId,
  EventInstanceId,
  Event,
  EventException,
  EventInstance,
  CreateEventPayload,
  CreateEventExceptionPayload,
  UpdateEventInstancePayload,
} from '../types/event';
import { UpdateEventInvitePayload, CreateEventInvitePayload, EventInvite } from '../types/eventInvite';
import { RevokeEmailUserPayload } from '../types/user';
import { toCursorPaginated } from '../utils';
import { CursorPaginationParams } from './common';
import { EndpointBuilder } from './helper';

export interface EventQueryParams {
  /**
   * Maximum amount of invitees. If more invitees are invited, the list is truncated
   * @default 0
   */
  inviteesMax?: number;
  /**
   * filter for all marked as favorite events
   * @default false
   */
  favorites?: boolean;
  /**
   * Query parameter that controls visibility of adhoc events.
   * When omitted, all event types are shown.
   */
  adhoc?: boolean;
  /**
   * filter for all time independent events
   * @default false
   */
  timeIndependent?: boolean;
}

export interface TimeRangeQueryParams {
  timeMin?: DateTime;
  timeMax?: DateTime;
}

export const addEventsEndpoints = <
  RoomEndpointBuilder extends EndpointBuilder<
    BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError, Record<string, unknown>, FetchBaseQueryMeta>,
    Tags,
    'api'
  >,
>(
  builder: RoomEndpointBuilder
) => ({
  /**
   * Fetches all available Events
   */
  getEvents: builder.query<
    CursorPaginated<Event | EventException>,
    CursorPaginationParams & TimeRangeQueryParams & EventQueryParams
  >({
    query: (params) => ({
      url: 'events',
      params,
    }),
    providesTags: (result) =>
      result
        ? [...result.data.map(({ id }) => ({ type: Tag.Event, id: id })), { type: Tag.Event, id: 'PARTIAL-LIST' }]
        : [{ type: Tag.Event, id: 'PARTIAL-LIST' }],
    transformResponse: (response: Array<Event | EventException>, meta): CursorPaginated<Event | EventException> => {
      return toCursorPaginated(meta?.response?.headers, response);
    },
  }),
  // Todo(r.floren): We could provide a query here that already spits out event instances based on the RRULE without using the instances endpoint
  // Along these lines
  // getEventsInstanced: builder.query<
  //   Array<EventInstance>,
  //   CursorPaginationParams & TimeRangeQueryParams & EventQueryParams
  // >({
  //   query: (params) => ({
  //     url: 'events',
  //     params: params,
  //   }),
  //   providesTags: (result) =>
  //     result
  //       ? [...result.map(({ id }) => ({ type: 'EventInstance' as const, id: id })), { type: 'EventInstance', id: 'PARTIAL-LIST' }]
  //       : [{ type: 'Room', id: 'PARTIAL-LIST' }],
  //   transformResponse: (response: ApiResponse<Event>): Event => {
  //     resolve rrules here add diffs from exceptions
  //     return camelcaseKeysDeep(response);
  //   },
  // }),
  /**
   * Create new event
   */
  createEvent: builder.mutation<Event, CreateEventPayload>({
    query: ({ ...payload }) => ({
      url: 'events',
      method: 'POST',
      body: snakeCaseKeys(payload, { deep: true }),
    }),
    invalidatesTags: [{ type: Tag.Event, id: 'PARTIAL-LIST' }],
  }),
  /**
   * Delete an event
   */
  deleteEvent: builder.mutation<unknown, EventId>({
    query: (id) => ({
      url: `events/${id}`,
      method: 'DELETE',
    }),
    invalidatesTags: (result, error, id) => [{ type: Tag.Event, id }],
  }),
  /**
   * Create new event exception
   */
  createEventException: builder.mutation<EventException, { eventId: EventId } & CreateEventExceptionPayload>({
    query: ({ eventId, ...payload }) => ({
      url: `events/${eventId}/instances`,
      method: 'POST',
      body: snakeCaseKeys(payload),
    }),
    invalidatesTags: [{ type: Tag.Event, id: 'PARTIAL-LIST' }],
  }),
  /**
   * Update an event
   */
  updateEvent: builder.mutation<Event, { eventId: EventId } & UpdateEventPayload>({
    query: ({ eventId, ...payload }) => ({
      url: `events/${eventId}`,
      method: 'PATCH',
      body: snakeCaseKeys(payload, { deep: true }),
    }),
    invalidatesTags: (res, error, { eventId }) => [{ type: Tag.Event, id: eventId }],
  }),
  /**
   * Reschedule all following events based on the from argument
   */
  rescheduleEvent: builder.mutation<EventException, { eventId: EventId } & RescheduleEventPayload>({
    query: ({ eventId, ...payload }) => ({
      url: `events/${eventId}/reschedule`,
      method: 'POST',
      body: snakeCaseKeys(payload),
    }),
    invalidatesTags: (res, error, { eventId }) => [{ type: Tag.Event, id: eventId }],
  }),
  /**
   * Used to get a single event
   */
  getEvent: builder.query<Event, { eventId: EventId } & EventQueryParams>({
    query: ({ eventId, ...params }) => ({
      url: `events/${eventId}`,
      params,
    }),
    providesTags: (result) => (result ? [{ type: Tag.Event, id: result.id }] : []),
  }),
  /**
   * Used to resolve the instances on the server. Use at last resort
   */
  getEventInstances: builder.query<Array<EventInstance>, { eventId: EventId } & EventQueryParams>({
    query: ({ eventId, ...params }) => ({
      url: `events/${eventId}/instances`,
      params,
    }),
    providesTags: (result) =>
      result
        ? [
            ...result.map(({ id }) => ({ type: Tag.EventInstance, id: id })),
            { type: Tag.EventInstance, id: 'PARTIAL-LIST' },
          ]
        : [{ type: Tag.EventInstance, id: 'PARTIAL-LIST' }],
  }),
  /**
   * Get a single event instance based on eventId and instanceId
   */
  getEventInstance: builder.query<EventInstance, { eventId: EventId; instanceId: EventInstanceId } & EventQueryParams>({
    query: ({ eventId, instanceId, ...params }) => ({
      url: `events/${eventId}/instances/${instanceId}`,
      params,
    }),
    providesTags: (result) => (result ? [{ type: Tag.EventInstance, id: result.id }] : []),
  }),
  /**
   * Update an event instance based on eventId and InstanceId
   */
  updateEventInstance: builder.mutation<
    EventInstance,
    { eventId: EventId; instanceId: EventInstanceId } & UpdateEventInstancePayload
  >({
    query: ({ eventId, instanceId, ...payload }) => ({
      url: `events/${eventId}/instances/${instanceId}`,
      method: 'PATCH',
      body: payload,
    }),
    invalidatesTags: (result, error, { eventId, instanceId }) => [
      { type: Tag.EventInstance, id: instanceId },
      { type: Tag.Event, id: eventId },
    ],
  }),
  /**
   * Get invites for an specific Event
   */
  getEventInvites: builder.query<Array<EventInvite>, { eventId: EventId }>({
    query: ({ eventId, ...params }) => ({
      url: `events/${eventId}/invites`,
      params,
    }),
    providesTags: (result) =>
      result
        ? [
            ...result.map(({ profile }) => ({
              type: Tag.EventInvite,
              id: 'id' in profile ? profile.id : profile.email,
            })),
            { type: Tag.EventInvite, id: 'PARTIAL-LIST' },
          ]
        : [{ type: Tag.EventInvite, id: 'PARTIAL-LIST' }],
  }),
  /**
   * Create an invite to an event for an specific user
   */
  createEventInvite: builder.mutation<unknown, { eventId: EventId } & CreateEventInvitePayload>({
    query: ({ eventId, ...payload }) => ({
      url: `events/${eventId}/invites`,
      method: 'POST',
      body: snakeCaseKeys(payload),
    }),
    invalidatesTags: () => [{ type: Tag.EventInvite, id: 'PARTIAL-LIST' }],
  }),
  /**
   * Create an invite to an event for an specific user
   */
  updateEventInvite: builder.mutation<unknown, { eventId: EventId; userId: UserId } & UpdateEventInvitePayload>({
    query: ({ eventId, userId, ...payload }) => ({
      url: `events/${eventId}/invites/${userId}`,
      method: 'PATCH',
      body: snakeCaseKeys(payload),
    }),
    invalidatesTags: (result, error, { userId }) => [{ type: Tag.EventInvite, id: userId }],
  }),

  /**
   * Delete/revoke an invite to an event for a specified user email
   */
  revokeEventUserInviteByEmail: builder.mutation<unknown, { eventId: EventId } & RevokeEmailUserPayload>({
    query: ({ eventId, ...payload }) => ({
      url: `events/${eventId}/invites/email`,
      method: 'DELETE',
      body: snakeCaseKeys(payload),
    }),
    invalidatesTags: () => [{ type: Tag.EventInvite, id: 'PARTIAL-LIST' }],
  }),
  /**
   * Delete/revoke an invite to an event for a specified user id
   */
  revokeEventUserInvite: builder.mutation<unknown, { eventId: EventId; userId: UserId }>({
    query: ({ eventId, userId }) => ({
      url: `events/${eventId}/invites/${userId}`,
      method: 'DELETE',
    }),
    invalidatesTags: () => [{ type: Tag.EventInvite, id: 'PARTIAL-LIST' }],
  }),
  /**
   * Accept an event invite for the current user to the specified event
   */
  acceptEventInvite: builder.mutation<unknown, { eventId: EventId }>({
    query: ({ eventId }) => ({
      url: `events/${eventId}/invite`,
      method: 'PATCH',
    }),
    invalidatesTags: (res, error, { eventId }) => [{ type: Tag.Event, id: eventId }],
  }),
  /**
   * Accept an event invite for the current user to the specified event
   */
  declineEventInvite: builder.mutation<unknown, { eventId: EventId }>({
    query: ({ eventId }) => ({
      url: `events/${eventId}/invite`,
      method: 'DELETE',
    }),
    invalidatesTags: (res, error, { eventId }) => [
      { type: Tag.Event, id: eventId },
      { type: Tag.EventInvite, id: eventId },
    ],
  }),
  /**
   * Create a shared folder for event
   * Possibly needs the body changed or no body at all
   */
  createEventSharedFolder: builder.mutation<unknown, { eventId: EventId }>({
    query: ({ eventId }) => ({
      url: `events/${eventId}/shared_folder`,
      method: 'PUT',
    }),
    invalidatesTags: (res, error, { eventId }) => [{ type: Tag.Event, id: eventId }],
  }),
  /**
   * Delete shared folder info
   */
  deleteEventSharedFolder: builder.mutation<unknown, { eventId: EventId; forceDeletion: boolean }>({
    query: ({ eventId, forceDeletion }) => ({
      url: `events/${eventId}/shared_folder?force_delete_reference_if_shared_folder_deletion_fails=${forceDeletion}`,
      method: 'DELETE',
    }),
    invalidatesTags: (res, error, { eventId }) => [{ type: Tag.Event, id: eventId }],
  }),
});
