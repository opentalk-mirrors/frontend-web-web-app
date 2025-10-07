// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Event } from '@opentalk/rest-api-rtk-query';
import { isTimelessEvent } from '@opentalk/rest-api-rtk-query';
import { RecurrencePattern } from '@opentalk/rest-api-rtk-query';
import { TrainingParticipationReportParameterSet } from '@opentalk/rest-api-rtk-query/src/types/event';
import { addMinutes } from 'date-fns';

import roundToUpper30 from '../../../utils/roundToUpper30';
import { CommonFrequencies } from '../../../utils/rruleUtils';
import { DEFAULT_MINUTES_DIFFERENCE } from '../constants';
import { MeetingFormValues, Streaming } from '../fragments/DashboardDateTimePicker';

export const defaultValues = {
  title: undefined,
  description: '',
  waitingRoom: true,
  password: undefined,
  isTimeDependent: true,
  recurrencePattern: CommonFrequencies.NONE,
  isAdhoc: false,
  sharedFolder: false,
  showMeetingDetails: true,
  streaming: {
    enabled: false,
  },
  e2eEncryption: false,
  trainingParticipationReport: {
    enabled: false,
  },
};

export const getDefaultEventDates = () => {
  const defaultStartDate = roundToUpper30(new Date());
  const defaultEndDate = addMinutes(defaultStartDate, DEFAULT_MINUTES_DIFFERENCE);

  return {
    startDate: defaultStartDate.toISOString(),
    endDate: defaultEndDate.toISOString(),
  };
};

export const getStreamingInitialValue = (existingEvent?: Event): Streaming => {
  return existingEvent?.streamingTargets
    ? {
        enabled: true,
        streamingTarget: existingEvent.streamingTargets[0],
      }
    : defaultValues.streaming;
};

export const getInitialValuesForExisting = (
  memoizedRecurrencePattern: RecurrencePattern | false,
  existingEvent: Event
): MeetingFormValues => {
  let eventDates;
  if (isTimelessEvent(existingEvent)) {
    eventDates = getDefaultEventDates();
  } else {
    eventDates = {
      startDate: existingEvent.startsAt.datetime,
      endDate: existingEvent.endsAt.datetime,
    };
  }

  return {
    title: existingEvent.title,
    description: existingEvent.description,
    waitingRoom: existingEvent.room.waitingRoom,
    password: existingEvent.room.password?.trim(),
    isTimeDependent: !existingEvent.isTimeIndependent,
    startDate: eventDates.startDate,
    endDate: eventDates.endDate,
    recurrencePattern: memoizedRecurrencePattern || CommonFrequencies.NONE,
    isAdhoc: Boolean(existingEvent.isAdhoc),
    sharedFolder: Boolean(existingEvent.sharedFolder),
    showMeetingDetails: Boolean(existingEvent.showMeetingDetails),
    streaming: getStreamingInitialValue(existingEvent),
    e2eEncryption: existingEvent.room.e2eEncryption,
    trainingParticipationReport: existingEvent?.trainingParticipationReport
      ? {
          enabled: true,
          parameter: existingEvent.trainingParticipationReport as TrainingParticipationReportParameterSet,
        }
      : defaultValues.trainingParticipationReport,
  };
};

export const getInitialValuesForNew = (
  memoizedRecurrencePattern: RecurrencePattern | false,
  isWaitingRoomEnabledByDefault: boolean
): MeetingFormValues => {
  const eventDates = getDefaultEventDates();

  return {
    title: defaultValues.title,
    description: defaultValues.description,
    waitingRoom: isWaitingRoomEnabledByDefault,
    password: defaultValues.password,
    isTimeDependent: defaultValues.isTimeDependent,
    startDate: eventDates.startDate,
    endDate: eventDates.endDate,
    recurrencePattern: memoizedRecurrencePattern || defaultValues.recurrencePattern,
    isAdhoc: defaultValues.isAdhoc,
    sharedFolder: defaultValues.sharedFolder,
    showMeetingDetails: defaultValues.showMeetingDetails,
    streaming: getStreamingInitialValue(),
    e2eEncryption: defaultValues.e2eEncryption,
    trainingParticipationReport: defaultValues.trainingParticipationReport,
  };
};

export const getInitialValues = (
  memoizedRecurrencePattern: RecurrencePattern | false,
  isWaitingRoomEnabledByDefault: boolean,
  existingEvent?: Event
): MeetingFormValues => {
  return existingEvent
    ? getInitialValuesForExisting(memoizedRecurrencePattern, existingEvent)
    : getInitialValuesForNew(memoizedRecurrencePattern, isWaitingRoomEnabledByDefault);
};
