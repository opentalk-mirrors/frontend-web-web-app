// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Event, CreateEventPayload, UpdateEventPayload, RecurrencePattern } from '@opentalk/rest-api-rtk-query';
import { TrainingParticipationReportParameterSet } from '@opentalk/rest-api-rtk-query/src/types/event';

import { CommonFrequencies } from '../../../utils/rruleUtils';
import { MeetingFormValues, Streaming, TrainingParticipationReport } from '../fragments/DashboardDateTimePicker';

export const createPayload = (
  values: MeetingFormValues,
  existingEvent?: Event
): CreateEventPayload | UpdateEventPayload => {
  let payload: CreateEventPayload | UpdateEventPayload = {
    title: values.title?.trim() || '',
    description: values.description?.trim() || '',
    waitingRoom: values.waitingRoom,
    showMeetingDetails: values.showMeetingDetails,
    password: createPasswordPayload(values.password),
    isTimeIndependent: !values.isTimeDependent,
    recurrencePattern: values.isTimeDependent ? createRecurrencePatternPayload(values.recurrencePattern) : undefined,
    isAdhoc: values.isAdhoc || false,
    hasSharedFolder: values.sharedFolder,
    streamingTargets: createStreamingPayload(values.streaming),
    e2eEncryption: values.e2eEncryption,
    trainingParticipationReport: createTrainingParticipationReportPayload(
      values.trainingParticipationReport,
      existingEvent?.trainingParticipationReport
    ),
  };

  if (values.isTimeDependent) {
    payload = {
      ...payload,
      startsAt: {
        datetime: values.startDate,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      endsAt: {
        datetime: values.endDate,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      isAllDay: false,
    };
  }

  return payload;
};

const createPasswordPayload = (password?: string) => {
  if (password && password.trim() !== '') {
    return password.trim();
  } else {
    return null;
  }
};

const createRecurrencePatternPayload = (recurrencePattern: RecurrencePattern) => {
  if (recurrencePattern === CommonFrequencies.NONE) {
    return undefined;
  } else {
    return [recurrencePattern];
  }
};

const createTrainingParticipationReportPayload = (
  trainingParticipationReport: TrainingParticipationReport,
  existingReport?: TrainingParticipationReportParameterSet
) => {
  const localValue = trainingParticipationReport;
  if (!localValue.enabled) {
    return existingReport ? null : undefined;
  }

  if (existingReport && JSON.stringify(existingReport) === JSON.stringify(localValue.parameter)) {
    return undefined;
  }

  return localValue.parameter;
};

const createStreamingPayload = (streaming: Streaming) => {
  if (streaming.enabled && streaming.streamingTarget) {
    return [streaming.streamingTarget];
  }
  return [];
};
