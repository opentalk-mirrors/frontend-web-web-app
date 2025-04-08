// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Opaque } from 'type-fest';

import { CallIn, DateTimeWithTimezone, EntityBase, InviteStatus } from './common';
import { EventInvite } from './eventInvite';
import { InviteCode, RoomId } from './room';
import { StreamingPlatform } from './streaming';

export type EventId = Opaque<string, 'eventId'>;
export type EventInstanceId = Opaque<string, 'eventInstanceId'>;

/**
 * Compound ID based on EventId and EventInstanceId.
 */
export type EventAndInstanceId = Opaque<string, 'eventAndInstanceId'>;

/**
 * Has to be a valid RFC string
 *
 * see https://icalendar.org/iCalendar-RFC-5545/3-8-5-3-recurrence-rule.html,
 *
 * more readable version of https://www.ietf.org/rfc/rfc2445.txt
 */
export type RecurrencePattern = string & { readonly __tag: unique symbol };

interface SharedFolderCredentials {
  url: string;
  password: string;
}
export interface SharedFolderData {
  read: SharedFolderCredentials;
  readWrite?: SharedFolderCredentials;
}

export interface TimeRange {
  /**
   * The earliest number of seconds after which the checkpoint can be created. Must be 0 or greater.
   */
  after: number;
  /**
   * The number of seconds within which the checkpoint can be created after the after value. Must be 0 or greater.
   */
  within: number;
}
export interface TrainingParticipationReportParameterSet {
  /**
   * default: { "after": 600, "within": 1200 }
   */
  initialCheckpointDelay: TimeRange;
  /**
   * default: { "after": 6300, "within": 1800 }
   */
  checkpointInterval: TimeRange;
}

/**
 * EventRoomInfo in an Event object
 */
type EventRoomInfo = {
  id: RoomId;
  password?: string;
  waitingRoom: boolean;
  e2eEncryption: boolean;
  callIn?: CallIn;
};

/**
 * The status of an event
 */
export enum EventStatus {
  Cancelled = 'cancelled',
  Ok = 'ok',
}

/**
 * The type of an event. This might actually have to be 2 types.
 * See issue #1784
 */
export enum EventType {
  Single = 'single',
  Recurring = 'recurring',
  Instance = 'instance',
  Exception = 'exception',
}

// Request Bodies
// These will be transformed to snake_case keys in the query.

/**
 * A new generic Event
 *
 * RequestBody for POST /events
 */
export interface CreateBaseEventPayload {
  title: string;
  description: string;
  waitingRoom: boolean;
  e2eEncryption: boolean;
  password?: string;
  isAdhoc?: boolean;
  showMeetingDetails?: boolean;
  hasSharedFolder?: boolean;
  streamingTargets?: Array<StreamingPlatform>;
  trainingParticipationReport?: TrainingParticipationReportParameterSet;
}

/**
 * A new timed Event
 *
 * RequestBody for POST /events
 */
export interface CreateTimedEventPayload extends CreateBaseEventPayload {
  isTimeIndependent: false;
  startsAt: DateTimeWithTimezone;
  endsAt: DateTimeWithTimezone;
  isAllDay: boolean;
  /// Recurrence pattern per RFC5545. Only RRULE values are valid. DTSTART and DTEND are forbidden as their values are already specified in the starts_at and ends_at fields.
  recurrencePattern?: Array<RecurrencePattern>;
}

/**
 * A new timeless Event
 *
 * RequestBody for POST /events
 */
export interface CreateTimelessEventPayload extends CreateBaseEventPayload {
  isTimeIndependent: true;
}

/**
 * * RequestBody for POST /events
 */
export type CreateEventPayload = CreateTimedEventPayload | CreateTimelessEventPayload;

/**
 * Object to create a new exception for a given event
 *
 * RequestBody for POST /events
 */
export interface CreateEventExceptionPayload {
  title?: string;
  description?: string;
  startsAt?: DateTimeWithTimezone;
  endsAt?: DateTimeWithTimezone;
  isAllDay?: boolean;
  /**
   * Event Id for which this new exception shall be created
   */
  recurringEventId: EventId;
  /**
   * The time the event instance would start per the recurrence pattern (RRULE).
   * Used to uniquely identify a specific occurrence of an recurring event.
   */
  originalStartsAt: string;
}

/**
 * Object to patch an event.
 *
 * RequestBody for PATCH /events/{eventId}
 */

export interface UpdateEventPayload {
  title?: string;
  description?: string;
  isTimeIndependent?: boolean;
  startsAt?: DateTimeWithTimezone;
  endsAt?: DateTimeWithTimezone;
  isAllDay?: boolean;
  recurrencePattern?: Array<RecurrencePattern>;
  waitingRoom?: boolean;
  e2eEncryption: boolean;
  password?: string;
  isAdhoc?: boolean;
  showMeetingDetails?: boolean;
  hasSharedFolder?: boolean;
  streamingTargets?: Array<StreamingPlatform>;
  trainingParticipationReport?: TrainingParticipationReportParameterSet | null;
}

/**
 * Object to patch an event instance/occurrence.
 *
 * RequestBody for PATCH /events/{eventId}/instances/{instanceId}
 */
export interface UpdateEventInstancePayload {
  title?: string;
  description?: string;
  isTimeIndependent?: boolean;
  startsAt?: DateTimeWithTimezone;
  endsAt?: DateTimeWithTimezone;
  isAllDay?: boolean;
  waitingRoom?: boolean;
  isAdhoc?: boolean;
  status: EventStatus;
}

/**
 * Body for the reschedule endpoint
 * This is used to reschedule all instances from the from property onwards.
 * Implementation Detail: This ends the current eventId and creates a new one.
 *
 * RequestBody of POST /events/{id}/reschedule
 */
export interface RescheduleEventPayload {
  /**
   * From this point in time _t_ the new schedule takes place
   */
  from: DateTimeWithTimezone;
  /**
   * Overwrites the start time of the event
   */
  startsAt?: DateTimeWithTimezone;
  /**
   * Overwrites the end time of the event
   */
  endsAt?: DateTimeWithTimezone;
  /**
   * Overwrites the isAllDay property of an event
   */
  isAllDay?: boolean;
  /**
   * Sets a different recurrence pattern for the events from time _t_
   */
  recurrencePattern?: Array<RecurrencePattern>;
}

// Response Objects

interface BaseEvent extends EntityBase {
  isTimeIndependent?: boolean;
  type: EventType;
  isFavorite: boolean;
  recurrenceId?: string;
  isAdhoc?: boolean;
}

// FIXME Find better name
// This is used to avoid duplicated properties in the Event types
interface AbstractEvent extends BaseEvent {
  id: EventId;
  title: string;
  description: string;
  room: EventRoomInfo;
  inviteesTruncated?: boolean;
  invitees?: Array<EventInvite>;
  inviteStatus: InviteStatus;
  sharedFolder?: SharedFolderData;
  showMeetingDetails?: boolean;
  streamingTargets?: Array<StreamingPlatform>;
  trainingParticipationReport?: TrainingParticipationReportParameterSet;
}

/**
 * Objects implementing this interface have time information present
 */
export interface TimedEvent extends AbstractEvent {
  isAllDay: boolean;
  startsAt: DateTimeWithTimezone;
  endsAt: DateTimeWithTimezone;
  recurrencePattern: Array<RecurrencePattern>;
}

/**
 * A timeless event
 * An event that has no time associated with it.
 */
export interface TimelessEvent extends AbstractEvent {
  type: EventType.Single;
  isTimeIndependent: true;
}

/**
 * A recurring event
 * An event with a time it takes place as well as a recurrencePattern
 * Based on this you can compute an EventInstance using the rrule contained in the recurrencePattern.
 */
export interface RecurringEvent extends AbstractEvent, TimedEvent {
  type: EventType.Recurring;
  isTimeIndependent: false;
}

/**
 * A single event
 * An event with a time it takes place.
 */
export interface SingleEvent extends AbstractEvent, TimedEvent {
  type: EventType.Single;
  isTimeIndependent: false;
}

interface EventOccurrence {
  /**
   * Opaque compound ID based on instanceId and eventId
   */
  id: EventAndInstanceId;
  recurringEventId: EventId;
  instanceId: EventInstanceId;
}

/**
 * An instance of an recurring event.
 *
 * Usually computed based on the recurrenceRule of an Event
 * but can also be retrieved by calling the instance endpoits
 * (GET /events/{eventId}/instances, GET /events/{eventId}/instances/{instanceId})
 */
export interface EventInstance extends BaseEvent, EventOccurrence {
  type: EventType.Instance;
  title: string;
  description: string;
  room: EventRoomInfo;
  inviteesTruncated?: boolean;
  invitees?: Array<EventInvite>;
  isAllDay: boolean;
  startsAt: DateTimeWithTimezone;
  endsAt: DateTimeWithTimezone;
  status: EventStatus;
  inviteStatus: InviteStatus;
}

/**
 * Exception of a single occurrence of a recurring event
 *
 * Apply this as a delta to the respective occurrence instance.
 */
export interface EventException extends BaseEvent, EventOccurrence {
  type: EventType.Exception;
  originalStartsAt: DateTimeWithTimezone;
  title?: string;
  description?: string;
  room?: EventRoomInfo;
  isAllDay?: boolean;
  status?: EventStatus;
  startsAt?: DateTimeWithTimezone;
  endsAt?: DateTimeWithTimezone;
}

export interface StreamingLink {
  name: string;
  url: string;
}

export interface MeetingDetails {
  inviteCodeId: InviteCode;
  callIn?: CallIn;
  streamingLinks: StreamingLink[];
}

export interface EventInfo {
  title: string;
  id: EventId;
  isAdhoc: boolean;
  meetingDetails?: MeetingDetails;
  roomId: RoomId;
  e2eEncryption: boolean;
}

/**
 * Event type. Different types of Events have their own type.
 * See SingleEvent, RecurringEvent and TimelessEvent for specific types of Events
 * Do note: This is different from a EventInstance and EventException.
 *
 * Usually retrieved by calling GET /events or GET /events/{eventId}
 */
export type Event = SingleEvent | RecurringEvent | TimelessEvent | TimedEvent;

export const isEventException = (obj: BaseEvent): obj is EventException => {
  return obj.type === EventType.Exception;
};
export const isEvent = (obj: BaseEvent): obj is Event => {
  return isRecurringEvent(obj) || isSingleEvent(obj) || isTimelessEvent(obj);
};

export const isRecurringEvent = (obj: BaseEvent): obj is RecurringEvent => {
  return obj.type === EventType.Recurring;
};
export const isEventInstance = (obj: BaseEvent): obj is EventInstance => {
  return obj.type === EventType.Instance;
};

export const isSingleEvent = (obj: BaseEvent): obj is SingleEvent => {
  return obj.isTimeIndependent === false && obj.type === EventType.Single;
};
export const isTimelessEvent = (obj: BaseEvent): obj is TimelessEvent => {
  return obj.isTimeIndependent === true && obj.type === EventType.Single;
};
