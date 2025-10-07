// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { CommonFrequencies } from '../../../utils/rruleUtils';
import { mockedSingleEvent, mockedStreamingTarget } from '../../../utils/testUtils';
import {
  getDefaultEventDates,
  getInitialValuesForNew,
  getInitialValuesForExisting,
  getStreamingInitialValue,
} from './initialValues';

describe('MeetingForms initialValues utils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('getDefaultEventDates', () => {
    it('should return start time, which is current system time rounded to next possible half hour', () => {
      const mockDate = new Date('2025-06-04T10:01:42Z');
      vi.setSystemTime(mockDate);
      const { startDate } = getDefaultEventDates();
      expect(startDate).toBe('2025-06-04T10:30:00.000Z');
    });

    it('should return end date, which is 30 minutes apart from the start time', () => {
      const mockDate = new Date('2025-06-04T10:00:00Z');
      vi.setSystemTime(mockDate);
      const { startDate, endDate } = getDefaultEventDates();
      expect(new Date(endDate).getTime() - new Date(startDate).getTime()).toBe(30 * 60 * 1000);
    });
  });

  describe('getStreamingInitialValue', () => {
    it('should return enabled streaming if event has streamingTargets', () => {
      const event = {
        ...mockedSingleEvent,
        streamingTargets: [mockedStreamingTarget],
      };
      const streaming = getStreamingInitialValue(event);
      expect(streaming.enabled).toBe(true);
      expect(streaming.streamingTarget).toBe(mockedStreamingTarget);
    });
    it('should return default streaming if event has no streamingTargets', () => {
      const streaming = getStreamingInitialValue(undefined);
      expect(streaming.enabled).toBe(false);
    });
  });

  describe('getInitialValuesForNew', () => {
    it('should return default values for a new event', () => {
      const mockDate = new Date('2025-06-04T10:01:42Z');
      vi.setSystemTime(mockDate);

      const memoizedRecurrencePattern = false;
      const isWaitingRoomEnabledByDefault = true;

      const values = getInitialValuesForNew(memoizedRecurrencePattern, isWaitingRoomEnabledByDefault);
      expect(values.title).toBeUndefined();
      expect(values.description).toBe('');
      expect(values.waitingRoom).toBe(isWaitingRoomEnabledByDefault);
      expect(values.password).toBeUndefined();
      expect(values.isTimeDependent).toBe(true);
      expect(values.startDate).toBe('2025-06-04T10:30:00.000Z');
      expect(values.endDate).toBe('2025-06-04T11:00:00.000Z');
      expect(values.recurrencePattern).toBe(CommonFrequencies.NONE);
      expect(values.isAdhoc).toBe(false);
      expect(values.sharedFolder).toBe(false);
      expect(values.showMeetingDetails).toBe(true);
      expect(values.streaming.enabled).toBe(false);
      expect(values.e2eEncryption).toBe(false);
      expect(values.trainingParticipationReport.enabled).toBe(false);
    });
  });

  describe('getInitialValuesForExisiting', () => {
    it('should return values of an exisiting event', () => {
      const memoizedRecurrencePattern = false;

      const values = getInitialValuesForExisting(memoizedRecurrencePattern, {
        ...mockedSingleEvent,
        streamingTargets: [mockedStreamingTarget],
      });

      expect(values.title).toBe(mockedSingleEvent.title);
      expect(values.description).toBe(mockedSingleEvent.description);
      expect(values.waitingRoom).toBe(mockedSingleEvent.room.waitingRoom);
      expect(values.password).toBe(mockedSingleEvent.room.password);
      expect(values.isTimeDependent).toBe(mockedSingleEvent.isTimeIndependent === false);
      expect(values.startDate).toBe(mockedSingleEvent.startsAt.datetime);
      expect(values.endDate).toBe(mockedSingleEvent.endsAt.datetime);
      expect(values.recurrencePattern).toBe(CommonFrequencies.NONE);
      expect(values.isAdhoc).toBe(mockedSingleEvent.isAdhoc);
      expect(values.sharedFolder).toBe(Boolean(mockedSingleEvent.sharedFolder));
      expect(values.showMeetingDetails).toBe(Boolean(mockedSingleEvent.showMeetingDetails));
      expect(values.streaming.enabled).toBe(true);
      expect(values.e2eEncryption).toBe(mockedSingleEvent.room.e2eEncryption);
      expect(values.trainingParticipationReport.enabled).toBe(false);
    });

    it('should set default dates for a time independet event', () => {
      const mockDate = new Date('2025-06-04T10:01:42Z');
      vi.setSystemTime(mockDate);

      const memoizedRecurrencePattern = false;

      const values = getInitialValuesForExisting(memoizedRecurrencePattern, {
        ...mockedSingleEvent,
        isTimeIndependent: true,
      });

      expect(values.startDate).toBe('2025-06-04T10:30:00.000Z');
      expect(values.endDate).toBe('2025-06-04T11:00:00.000Z');
    });
  });
});
