// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { RRule } from '@heinlein-video/rrule';
import {
  DateTime,
  DateTimeWithTimezone,
  Event,
  EventException,
  EventInstanceId,
  isTimelessEvent,
  RecurringEvent,
  SingleEvent,
  EventId,
  EventInstance,
} from '@opentalk/rest-api-rtk-query';
import { Interval, isWithinInterval, areIntervalsOverlapping } from 'date-fns';
import { memoize, sortBy } from 'lodash';

import { RoomEvent } from '../store/slices/eventSlice';
import { ChatMessage } from '../types/chat';

export enum TimePerspectiveFilter {
  TimeIndependent = 'timeindependent',
  Future = 'future',
  Past = 'past',
}

export enum EventDeletionType {
  One = 'one',
  All = 'all', // all events + corresponding data
}

/**
 * Finds an overlapping for a current event in an array of events.
 * @param {Date} currentEventStart - start time of the current event.
 * @param {Date} currentEventEnd - end time of the current event
 * @param {Array<Event | EventException>} events - array of events to check for overlaps.
 * @returns returns the first event that overlaps with the current event, or undefined if no overlap is found.
 */
export const findOverlappingEvent = (
  currentEventStart: Date,
  currentEventEnd: Date,
  events: Array<Event | EventException | EventInstance>,
  currentEventId?: EventId
): SingleEvent | RecurringEvent | undefined => {
  if (events.length > 0) {
    const potentialOverlappingEvents: Array<SingleEvent | RecurringEvent> = events.filter(
      (event) => !isTimelessEvent(event)
    ) as Array<SingleEvent | RecurringEvent>;

    const currentEventInterval: Interval = {
      start: currentEventStart,
      end: currentEventEnd,
    };

    const validOverlappingEventFound = potentialOverlappingEvents.find((event) => {
      const overlappingEventInterval: Interval = {
        start: new Date(event.startsAt.datetime),
        end: new Date(event.endsAt.datetime),
      };

      return (
        areIntervalsOverlapping(currentEventInterval, overlappingEventInterval) &&
        (currentEventId ? event.id !== currentEventId : true)
      );
    });

    if (validOverlappingEventFound) {
      return validOverlappingEventFound;
    }
  }

  return undefined;
};

/**
 * The function `generateInstanceId` creates a unique event instance ID based on the provided start
 * time.
 * @param {DateTimeWithTimezone} startTime - The `generateInstanceId` function takes a parameter
 * `startTime` of type `DateTimeWithTimezone`. This parameter represents the starting time of an event
 * with both date and time information.
 * @returns The function `generateInstanceId` returns a string that represents a unique event instance
 * ID based on the provided `startTime` parameter. The format of the returned string is a combination
 * of the date and time components extracted from the `startTime` parameter in UTC format.
 */
export const generateInstanceId = (startTime: DateTimeWithTimezone): EventInstanceId => {
  const formatTimeString = (number: number) => String(number).padStart(2, '0');

  const startDate = new Date(startTime.datetime);

  const hours = formatTimeString(startDate.getUTCHours());
  const minutes = formatTimeString(startDate.getUTCMinutes());
  const seconds = formatTimeString(startDate.getUTCSeconds());
  const month = formatTimeString(startDate.getUTCMonth() + 1);
  const day = formatTimeString(startDate.getUTCDate());
  const year = startDate.getUTCFullYear();

  const timeString = `${hours}${minutes}${seconds}Z`;
  const dateString = `${year}${month}${day}T`;

  return `${dateString}${timeString}` as EventInstanceId;
};

//Creates interval so it covers the following cases:
//First instance and asset is after end, but still in interval
//Last instance and asset is before start, but still in interval
//Default case of having previous and next instance to calculate off of
const calculateInterval = (
  start: number,
  end: number,
  prevInstanceTime?: number,
  nextInstanceTime?: number
): Interval => {
  const middlePoint = (start + end) / 2;

  const startOfInterval = prevInstanceTime
    ? middlePoint - (start - prevInstanceTime) / 2
    : start - (nextInstanceTime ? (nextInstanceTime - end) / 2 : 0);

  const endOfInterval = nextInstanceTime
    ? middlePoint + (nextInstanceTime - end) / 2
    : end + (prevInstanceTime ? (start - prevInstanceTime) / 2 : 0);

  return { start: new Date(startOfInterval), end: new Date(endOfInterval) };
};

export interface RecurrenceInstance {
  start: string;
  end: string;
  originalStart: string;
  recurrencePattern: string;
}

/**
 * Checks if asset belongs to a specific recurring event instance by calculating an interval based on the previous and next instances
 */
export const checkAssetPredicate = (assetCreatedAt: DateTime, recurrenceInstance: RecurrenceInstance) => {
  const assetDate = new Date(assetCreatedAt);
  const assetDateInMs = assetDate.getTime();
  const { start, end, originalStart, recurrencePattern } = recurrenceInstance;

  const recurrence = RRule.parseString(recurrencePattern);
  const rrule = new RRule({ ...recurrence, dtstart: new Date(originalStart) });

  const startInMs = new Date(start).getTime();
  const endInMs = new Date(end).getTime();

  // Type assertion necessary, since the library's return type definition is not accurate
  const prevInstance = rrule.before(new Date(start)) as Date | null;
  const nextInstance = rrule.after(new Date(end)) as Date | null;

  // No previous instance, and asset is before the current instance end
  if (!prevInstance && assetDateInMs < endInMs) {
    return true;
  }

  // No next instance, and asset is after the current instance start
  if (!nextInstance && assetDateInMs > startInMs) {
    return true;
  }

  const interval = calculateInterval(startInMs, endInMs, prevInstance?.getTime(), nextInstance?.getTime());

  // Check if asset date is within the interval of the current instance
  return interval ? isWithinInterval(assetDate, interval) : false;
};

export const mergeAndSortMessagesEndEvents = memoize(
  (messages: Array<ChatMessage | RoomEvent>, events: Array<ChatMessage | RoomEvent>) =>
    sortBy([...messages, ...events], ['timestamp']),
  (messages, events) => JSON.stringify(messages) + JSON.stringify(events)
);
