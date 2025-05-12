// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Event, CreateEventPayload, UpdateEventPayload } from '@opentalk/rest-api-rtk-query';
import { formatRFC3339 } from 'date-fns';
import { FormikValues } from 'formik';

import { CommonFrequencies } from '../../../utils/rruleUtils';

export const createPayload = (values: FormikValues, existingEvent?: Event): CreateEventPayload | UpdateEventPayload => {
  let payload: CreateEventPayload | UpdateEventPayload = {
    title: values.title.trim() || '',
    description: values.description.trim() || '',
    waitingRoom: values.waitingRoom,
    showMeetingDetails: values.showMeetingDetails,
    password: values.password?.trim() !== '' ? values.password?.trim() : null,
    isTimeIndependent: !values.isTimeDependent,
    recurrencePattern: [],
    isAdhoc: values.isAdhoc || false,
    hasSharedFolder: values.sharedFolder || false,
    streamingTargets: createStreamingPayload(values),
    e2eEncryption: values.e2eEncryption || false,
    trainingParticipationReport: createTrainingParticipationReportPayload(values, existingEvent),
  };

  if (values.recurrencePattern) {
    payload = {
      ...payload,
      recurrencePattern: values.recurrencePattern !== CommonFrequencies.NONE ? [values.recurrencePattern] : undefined,
    };
  }

  if (values.isTimeDependent) {
    payload = {
      ...payload,
      startsAt: {
        datetime: formatRFC3339(new Date(values.startDate)),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      endsAt: {
        datetime: formatRFC3339(new Date(values.endDate)),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      isAllDay: false,
    };
  }

  return payload;
};

export const createTrainingParticipationReportPayload = (values: FormikValues, existingEvent?: Event) => {
  const localValue = values.trainingParticipationReport;
  if (!localValue.enabled) {
    return existingEvent?.trainingParticipationReport ? null : undefined;
  }

  if (
    existingEvent?.trainingParticipationReport &&
    JSON.stringify(existingEvent.trainingParticipationReport) === JSON.stringify(localValue.parameter)
  ) {
    return undefined;
  }

  return localValue.parameter;
};

export const createStreamingPayload = (values: FormikValues) => {
  return values.streaming.enabled ? [values.streaming.platform] : [];
};
