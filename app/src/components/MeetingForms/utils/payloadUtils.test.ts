// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { CreateTimedEventPayload } from '@opentalk/rest-api-rtk-query/src/types/event';

import { CommonFrequencies } from '../../../utils/rruleUtils';
import { mockedStreamingTarget, mockedSingleEvent, mockedMeetingFormValues } from '../../../utils/testUtils';
import { createPayload } from './payloadUtils';

const reportParameters = {
  initialCheckpointDelay: { after: 100, within: 100 },
  checkpointInterval: { after: 100, within: 100 },
};

describe('createPayload', () => {
  it('should trim existing title', () => {
    const payload = createPayload({ ...mockedMeetingFormValues, title: '  ' + mockedMeetingFormValues.title + '  ' });
    expect(payload.title).toBe(mockedMeetingFormValues.title?.trim());
  });

  it('should set title default value if title is not set', () => {
    const payload = createPayload({ ...mockedMeetingFormValues, title: undefined });
    expect(payload.title).toBe('');
  });

  it('should trim existing description', () => {
    const payload = createPayload({
      ...mockedMeetingFormValues,
      description: '  ' + mockedMeetingFormValues.description + '  ',
    });
    expect(payload.description).toBe(mockedMeetingFormValues.description?.trim());
  });

  it('should set description default value if description is not set', () => {
    const payload = createPayload({ ...mockedMeetingFormValues, description: undefined });
    expect(payload.description).toBe('');
  });

  it('should set waiting room state correctly', () => {
    const payload = createPayload({ ...mockedMeetingFormValues });
    expect(payload.waitingRoom).toBe(mockedMeetingFormValues.waitingRoom);
  });

  it('should set show meeting details state correctly', () => {
    const payload = createPayload({ ...mockedMeetingFormValues });
    expect(payload.showMeetingDetails).toBe(mockedMeetingFormValues.showMeetingDetails);
  });

  it('should trim password', () => {
    const payload = createPayload({
      ...mockedMeetingFormValues,
      password: '  ' + mockedMeetingFormValues.password + '  ',
    });
    expect(payload.password).toBe(mockedMeetingFormValues.password?.trim());
  });

  it('should set password to undefined if empty', () => {
    const payload = createPayload({ ...mockedMeetingFormValues, password: '   ' });
    expect(payload.password).toBeUndefined();
  });

  it('should set time dependant state correctly', () => {
    const payload = createPayload({ ...mockedMeetingFormValues });
    expect(payload.isTimeIndependent).toBe(!mockedMeetingFormValues.isTimeDependent);
  });

  it('should set is adhoc state correctly', () => {
    const payload = createPayload({ ...mockedMeetingFormValues });
    expect(payload.isAdhoc).toBe(mockedMeetingFormValues.isAdhoc);
  });

  it('should set is adhoc state to false if undefined', () => {
    const payload = createPayload({ ...mockedMeetingFormValues, isAdhoc: undefined });
    expect(payload.isAdhoc).toBe(false);
  });

  it('should set shared folder state correctly', () => {
    const payload = createPayload({ ...mockedMeetingFormValues });
    expect(payload.hasSharedFolder).toBe(mockedMeetingFormValues.sharedFolder);
  });

  it('should set e2e encryption state correctly', () => {
    const payload = createPayload({ ...mockedMeetingFormValues });
    expect(payload.e2eEncryption).toBe(mockedMeetingFormValues.e2eEncryption);
  });

  it('should set streaming target to empty array if streaming is disabled', () => {
    const payload = createPayload({
      ...mockedMeetingFormValues,
      streaming: { enabled: false, streamingTarget: mockedStreamingTarget },
    });
    expect(payload.streamingTargets).toStrictEqual([]);
  });

  it('should set streaming target if streaming is enabled', () => {
    const payload = createPayload({
      ...mockedMeetingFormValues,
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
      ...mockedMeetingFormValues,
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
      ...mockedMeetingFormValues,
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
      ...mockedMeetingFormValues,
      trainingParticipationReport: { enabled: false, parameter: undefined },
    });
    expect(payload.trainingParticipationReport).toBeUndefined();
  });

  it('should set participation report to null if not enabled but there is already an exisiting report parameters', () => {
    const payload = createPayload(
      {
        ...mockedMeetingFormValues,
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
        ...mockedMeetingFormValues,
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
        ...mockedMeetingFormValues,
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
      ...mockedMeetingFormValues,
      recurrencePattern: CommonFrequencies.NONE,
    }) as CreateTimedEventPayload;

    expect(payload.recurrencePattern).toBeUndefined();
  });

  it('should set array of recurrence pattern if recurrence pattern other to none is set', () => {
    const payload = createPayload({
      ...mockedMeetingFormValues,
      recurrencePattern: CommonFrequencies.DAILY,
    }) as CreateTimedEventPayload;

    expect(payload.recurrencePattern).toStrictEqual([CommonFrequencies.DAILY]);
  });
});
