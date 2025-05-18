// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { CreateTimedEventPayload } from '@opentalk/rest-api-rtk-query/src/types/event';

import { CommonFrequencies } from '../../../utils/rruleUtils';
import { mockedStreamingTarget, mockedSingleEvent } from '../../../utils/testUtils';
import { MeetingFormValues } from '../fragments/DashboardDateTimePicker';
import { createPayload } from './payloadUtils';

const meetingFormValues: MeetingFormValues = {
  title: '  Test Meeting  ',
  description: '  Description  ',
  waitingRoom: true,
  showMeetingDetails: false,
  password: '  secret  ',
  isTimeDependent: true,
  startDate: '2025-06-05T10:00:00Z',
  endDate: '2025-06-05T11:00:00Z',
  isAdhoc: false,
  sharedFolder: true,
  streaming: { enabled: false, streamingTarget: undefined },
  e2eEncryption: true,
  trainingParticipationReport: { enabled: false, parameter: undefined },
  recurrencePattern: CommonFrequencies.NONE,
};

const reportParameters = {
  initialCheckpointDelay: { after: 100, within: 100 },
  checkpointInterval: { after: 100, within: 100 },
};

describe('createPayload', () => {
  it('should trim existing title', () => {
    const payload = createPayload(meetingFormValues);
    expect(payload.title).toBe(meetingFormValues.title?.trim());
  });

  it('should set title default value if title is not set', () => {
    const payload = createPayload({ ...meetingFormValues, title: undefined });
    expect(payload.title).toBe('');
  });

  it('should trim existing description', () => {
    const payload = createPayload(meetingFormValues);
    expect(payload.description).toBe(meetingFormValues.description?.trim());
  });

  it('should set description default value if description is not set', () => {
    const payload = createPayload({ ...meetingFormValues, description: undefined });
    expect(payload.description).toBe('');
  });

  it('should set waiting room state correctly', () => {
    const payload = createPayload({ ...meetingFormValues });
    expect(payload.waitingRoom).toBe(meetingFormValues.waitingRoom);
  });

  it('should set show meeting details state correctly', () => {
    const payload = createPayload({ ...meetingFormValues });
    expect(payload.showMeetingDetails).toBe(meetingFormValues.showMeetingDetails);
  });

  it('should trim password', () => {
    const payload = createPayload(meetingFormValues);
    expect(payload.password).toBe(meetingFormValues.password?.trim());
  });

  it('should set password to undefined if empty', () => {
    const payload = createPayload({ ...meetingFormValues, password: '   ' });
    expect(payload.password).toBeUndefined();
  });

  it('should set time dependant state correctly', () => {
    const payload = createPayload({ ...meetingFormValues });
    expect(payload.isTimeIndependent).toBe(!meetingFormValues.isTimeDependent);
  });

  it('should set is adhoc state correctly', () => {
    const payload = createPayload({ ...meetingFormValues });
    expect(payload.isAdhoc).toBe(meetingFormValues.isAdhoc);
  });

  it('should set is adhoc state to false if undefined', () => {
    const payload = createPayload({ ...meetingFormValues, isAdhoc: undefined });
    expect(payload.isAdhoc).toBe(false);
  });

  it('should set shared folder state correctly', () => {
    const payload = createPayload({ ...meetingFormValues });
    expect(payload.hasSharedFolder).toBe(meetingFormValues.sharedFolder);
  });

  it('should set e2e encryption state correctly', () => {
    const payload = createPayload({ ...meetingFormValues });
    expect(payload.e2eEncryption).toBe(meetingFormValues.e2eEncryption);
  });

  it('should set streaming target to empty array if streaming is disabled', () => {
    const payload = createPayload({
      ...meetingFormValues,
      streaming: { enabled: false, streamingTarget: mockedStreamingTarget },
    });
    expect(payload.streamingTargets).toStrictEqual([]);
  });

  it('should set streaming target if streaming is enabled', () => {
    const payload = createPayload({
      ...meetingFormValues,
      streaming: { enabled: true, streamingTarget: mockedStreamingTarget },
    });
    expect(payload.streamingTargets).toStrictEqual([mockedStreamingTarget]);
  });

  it('should set start and end time to undefined, if time independent', () => {
    const eventTimeRelevantData = {
      isTimeDependent: false,
      startDate: '2025-06-05T10:00:00Z',
      endDate: '2025-06-05T11:00:00Z',
    };

    const payload = createPayload({
      ...meetingFormValues,
      ...eventTimeRelevantData,
    }) as CreateTimedEventPayload;

    expect(payload.startsAt).toBeUndefined();
    expect(payload.endsAt).toBeUndefined();
  });

  it('should set start and end time correctly, if time dependent', () => {
    const eventTimeRelevantData = {
      isTimeDependent: true,
      startDate: '2025-06-05T10:00:00Z',
      endDate: '2025-06-05T11:00:00Z',
    };

    const payload = createPayload({
      ...meetingFormValues,
      ...eventTimeRelevantData,
    }) as CreateTimedEventPayload;

    const expectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    expect(payload.startsAt.datetime).toBe(eventTimeRelevantData.startDate);
    expect(payload.startsAt.timezone).toBe(expectedTimezone);
    expect(payload.endsAt.datetime).toBe(eventTimeRelevantData.endDate);
    expect(payload.endsAt.timezone).toBe(expectedTimezone);
  });

  it('should set participation report to undefined if not enabled and no exisiting report yet', () => {
    const payload = createPayload({
      ...meetingFormValues,
      trainingParticipationReport: { enabled: false, parameter: undefined },
    });
    expect(payload.trainingParticipationReport).toBeUndefined();
  });

  it('should set participation report to null if not enabled but there is already an exisiting report parameters', () => {
    const payload = createPayload(
      {
        ...meetingFormValues,
        trainingParticipationReport: { enabled: false, parameter: undefined },
      },
      {
        ...mockedSingleEvent,
        trainingParticipationReport: reportParameters,
      }
    );

    expect(payload.trainingParticipationReport).toBeNull();
  });

  it('should set participation report to undefined if new report parameters are equal to exisiting report parameters', () => {
    const payload = createPayload(
      {
        ...meetingFormValues,
        trainingParticipationReport: { enabled: true, parameter: reportParameters },
      },
      {
        ...mockedSingleEvent,
        trainingParticipationReport: reportParameters,
      }
    );

    expect(payload.trainingParticipationReport).toBeUndefined();
  });

  it('should set new participation report if new report parameters are different to exisiting report parameters', () => {
    const newReportParameters = {
      initialCheckpointDelay: { after: 200, within: 100 },
      checkpointInterval: { after: 200, within: 100 },
    };

    const payload = createPayload(
      {
        ...meetingFormValues,
        trainingParticipationReport: { enabled: true, parameter: newReportParameters },
      },
      {
        ...mockedSingleEvent,
        trainingParticipationReport: reportParameters,
      }
    );

    expect(payload.trainingParticipationReport).toBe(newReportParameters);
  });

  it('should set recurrence pattern to undefined if recurrence pattern is set to none', () => {
    const payload = createPayload({
      ...meetingFormValues,
      recurrencePattern: CommonFrequencies.NONE,
    }) as CreateTimedEventPayload;

    expect(payload.recurrencePattern).toBeUndefined();
  });

  it('should set array of recurrence pattern if recurrence pattern other to none is set', () => {
    const payload = createPayload({
      ...meetingFormValues,
      recurrencePattern: CommonFrequencies.DAILY,
    }) as CreateTimedEventPayload;

    expect(payload.recurrencePattern).toStrictEqual([CommonFrequencies.DAILY]);
  });
});
