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
  InviteStatus,
  isEvent,
  isEventException,
  isRecurringEvent,
  isTimelessEvent,
  RecurringEvent,
  SingleEvent,
  EventId,
} from '@opentalk/rest-api-rtk-query';
import { addMonths, Interval, isWithinInterval, subMonths, areIntervalsOverlapping } from 'date-fns';
import { cloneDeep, findIndex, orderBy } from 'lodash';

import { getISOStringWithoutMilliseconds } from './timeUtils';

export enum TimePerspectiveFilter {
  TimeIndependent = 'timeindependent',
  Future = 'future',
  Past = 'past',
}

export enum EventDeletionType {
  One = 'one',
  All = 'all', // all events + corresponding data
}

const DEFAULT_MONTHS_CONSIDERED = 3;

const mapDateToRecurringEvent = (recurrenceDate: Date, initialEvent: RecurringEvent) => {
  const recurringEvent = cloneDeep(initialEvent);
  const recurrenceStartDate = new Date(initialEvent.startsAt.datetime);
  const recurrenceEndDate = new Date(initialEvent.endsAt.datetime);

  const startDate = new Date(recurrenceStartDate);
  startDate.setDate(recurrenceDate.getDate());
  startDate.setMonth(recurrenceDate.getMonth());
  startDate.setUTCFullYear(recurrenceDate.getUTCFullYear());
  recurringEvent.startsAt = {
    datetime: getISOStringWithoutMilliseconds(startDate),
    timezone: initialEvent.startsAt.timezone,
  };

  const endDate = new Date(recurrenceEndDate);
  endDate.setDate(recurrenceDate.getDate());
  endDate.setMonth(recurrenceDate.getMonth());
  endDate.setUTCFullYear(recurrenceDate.getUTCFullYear());
  recurringEvent.endsAt = {
    datetime: getISOStringWithoutMilliseconds(endDate),
    timezone: initialEvent.endsAt.timezone,
  };

  return recurringEvent;
};

const isRecurringEventException = (event: RecurringEvent, exceptions: EventException[]) => {
  return findIndex(exceptions, { recurringEventId: event.id, originalStartsAt: event.startsAt }) != -1;
};

const createRecurringEventInstances = (
  event: RecurringEvent,
  maxMonths: number = DEFAULT_MONTHS_CONSIDERED,
  filter?: TimePerspectiveFilter,
  exceptions?: EventException[]
) => {
  const today = new Date();
  const recurrenceStartDate = new Date(event.startsAt.datetime);

  let windowStartOffset = 0;
  let windowEndOffset = maxMonths;

  if (filter === TimePerspectiveFilter.Past) {
    windowStartOffset = maxMonths;
    windowEndOffset = 0;
  }

  const windowStartDate = subMonths(today, windowStartOffset);
  const windowEndDate = addMonths(today, windowEndOffset);

  const partialRule = RRule.parseString(event.recurrencePattern[0]);

  partialRule.dtstart = recurrenceStartDate;
  if (!partialRule.until) {
    partialRule.until = windowEndDate;
  } else if (windowEndDate < partialRule.until) {
    partialRule.until = windowEndDate;
  }

  const rule = new RRule({
    ...partialRule,
  });

  const generatedRecurrenceDates = rule.between(windowStartDate, windowEndDate, true);

  return generatedRecurrenceDates
    .map((generatedRecurrenceDate) => mapDateToRecurringEvent(generatedRecurrenceDate, event))
    .filter((recurringEvent) => (exceptions ? !isRecurringEventException(recurringEvent, exceptions) : true));
};

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export const orderEventsByDate = (events: Event[], sortDirection: SortDirection = SortDirection.ASC) =>
  orderBy(
    events,
    [
      (event: Event) => {
        if (isTimelessEvent(event)) {
          return new Date(event.createdAt);
        }
        return new Date(event.startsAt.datetime);
      },
    ],
    [sortDirection]
  );

export const appendRecurringEventInstances = (
  eventList: (EventException | Event)[],
  filterDeclined?: boolean,
  maxMonths?: number,
  filter?: TimePerspectiveFilter
): Event[] => {
  const events = Array<Event>();
  const exceptions = eventList.filter((event): event is EventException => isEventException(event));

  eventList
    .filter((event): event is Event => isEvent(event))
    .filter((event) => (filterDeclined ? event.inviteStatus !== InviteStatus.Declined : true))
    .forEach((event) => {
      if (!isTimelessEvent(event) && isRecurringEvent(event)) {
        createRecurringEventInstances(event, maxMonths, filter, exceptions).forEach((recurringEvent) => {
          events.push(recurringEvent);
        });
      } else {
        events.push(event);
      }
    });

  return events;
};

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
  events: Event[] | EventException[],
  currentEventId?: EventId
): SingleEvent | RecurringEvent | undefined => {
  if (events.length > 0) {
    const potentialOverlappingEvents: Array<SingleEvent | RecurringEvent> = appendRecurringEventInstances(
      events
    ).filter((event) => !isTimelessEvent(event)) as Array<SingleEvent | RecurringEvent>;

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
