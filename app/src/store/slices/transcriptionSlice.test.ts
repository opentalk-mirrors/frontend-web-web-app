// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { TranscriptionSegment } from '../../api/types/incoming/transcription';
import { TRANSCRIPTION_SEGMENT_EXPIRATION_TIME_MS, TRANSCRIPTION_SEGMENT_HISTORY_LIMIT } from '../../constants';
import reducer, { removeExpiredSegments, segmentReceived, TranscriptionState } from './transcriptionSlice';

describe('transcriptionSlice', () => {
  it('should store new segments when segment received is called', () => {
    const segment = {
      message: 'segment',
      participantId: '1',
      trackId: 'track-1',
      startsAt: new Date().toISOString(),
      endsAt: new Date().toISOString(),
      text: 'Hello world',
    } as TranscriptionSegment;

    const state = reducer(undefined, segmentReceived(segment));

    expect(state.segments).toHaveLength(1);
    expect(state.segments[0]).toEqual(segment);
  });
  it('should not store more than SEGMENT_HISTORY_LIMIT segments', () => {
    const aLotOfSegments = Array.from(
      { length: TRANSCRIPTION_SEGMENT_HISTORY_LIMIT },
      (_, i) =>
        ({
          message: 'segment',
          participantId: `${i}`,
          trackId: `track-${i}`,
          startsAt: new Date().toISOString(),
          endsAt: new Date().toISOString(),
          text: `Segment ${i}`,
        }) as TranscriptionSegment
    );

    const initialState = aLotOfSegments.reduce(
      (acc: TranscriptionState | undefined, segment: TranscriptionSegment) => reducer(acc, segmentReceived(segment)),
      undefined as TranscriptionState | undefined
    ) as TranscriptionState;

    expect(initialState.segments).toHaveLength(TRANSCRIPTION_SEGMENT_HISTORY_LIMIT);

    const newSegment = {
      message: 'segment',
      participantId: 'new',
      trackId: 'track-new',
      startsAt: new Date().toISOString(),
      endsAt: new Date().toISOString(),
      text: 'New Segment',
    } as TranscriptionSegment;

    const newState = reducer(initialState, segmentReceived(newSegment));

    expect(newState.segments).toHaveLength(TRANSCRIPTION_SEGMENT_HISTORY_LIMIT);
    expect(newState.segments[0].participantId).toBe('1'); // The first segment should be removed
    expect(newState.segments[TRANSCRIPTION_SEGMENT_HISTORY_LIMIT - 1]).toEqual(newSegment); // The last segment should be the new one
  });
  it('should remove expired segments', () => {
    const now = new Date();
    const expiredSegment = {
      participantId: '1',
      text: 'Expired segment',
      endsAt: new Date(now.getTime() - TRANSCRIPTION_SEGMENT_EXPIRATION_TIME_MS - 1000).toISOString(),
    } as TranscriptionSegment;
    const validSegment = {
      participantId: '2',
      text: 'Valid segment',
      endsAt: new Date(now.getTime() - TRANSCRIPTION_SEGMENT_EXPIRATION_TIME_MS + 1000).toISOString(),
    } as TranscriptionSegment;

    const initialState = reducer(undefined, segmentReceived(expiredSegment));
    const stateWithExpiredAndValidSegment = reducer(initialState, segmentReceived(validSegment));

    const newState = reducer(stateWithExpiredAndValidSegment, removeExpiredSegments(new Date()));

    expect(newState.segments).toHaveLength(1);
    expect(newState.segments[0]).toEqual(validSegment);
  });
});
