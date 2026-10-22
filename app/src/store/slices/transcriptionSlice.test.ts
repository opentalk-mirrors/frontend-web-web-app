// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';

import {
  TranscriptionLanguageKey,
  TranscriptionSegment,
  TranscriptionStatus,
} from '../../api/types/incoming/transcription';
import { TRANSCRIPTION_SEGMENT_EXPIRATION_TIME_MS, TRANSCRIPTION_SEGMENT_HISTORY_LIMIT } from '../../constants';
import { JoinSuccessInternalState } from '../../types';
import { joinSuccess } from '../commonActions';
import reducer, {
  removeExpiredSegments,
  saveTranscriptionLanguageToLocalStorage,
  segmentReceived,
  startTranscriptionSliceListeners,
  transcriptionModesUpdated,
  TranscriptionState,
} from './transcriptionSlice';

describe('transcriptionSlice', () => {
  describe('language restore on join', () => {
    const setupStore = () => {
      const listenerMiddleware = createListenerMiddleware();
      startTranscriptionSliceListeners(listenerMiddleware.startListening as never);
      return configureStore({
        reducer: { transcription: reducer },
        middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(listenerMiddleware.middleware),
      });
    };

    const joinWithLanguage = (language?: string) =>
      joinSuccess({
        transcription: {
          status: TranscriptionStatus.Running,
          language: language as TranscriptionLanguageKey,
          liveTranscription: true,
        },
      } as JoinSuccessInternalState);

    beforeEach(() => {
      localStorage.removeItem('transcription-language');
    });

    it('prefers the language of the running transcription over the stored one', async () => {
      saveTranscriptionLanguageToLocalStorage('en');
      const store = setupStore();

      store.dispatch(joinWithLanguage('de'));
      await Promise.resolve();

      expect(store.getState().transcription.language).toBe('de');
      expect(localStorage.getItem('transcription-language')).toBe('en');
    });

    it.each([undefined, 'fr'])('falls back to the stored language when the server sends %s', async (language) => {
      saveTranscriptionLanguageToLocalStorage('en');
      const store = setupStore();

      store.dispatch(joinWithLanguage(language));
      await Promise.resolve();

      expect(store.getState().transcription.language).toBe('en');
    });
  });

  describe('transcription modes', () => {
    it('stores the modes when they are updated', () => {
      const state = reducer(
        undefined,
        transcriptionModesUpdated({ liveTranscription: true, meetingProtocol: { pseudonymous: true, paused: false } })
      );

      expect(state.liveTranscription).toBe(true);
      expect(state.meetingProtocol).toEqual({ pseudonymous: true, paused: false });
    });

    it('clears the meeting protocol when it is no longer part of the modes', () => {
      const withProtocol = reducer(
        undefined,
        transcriptionModesUpdated({ liveTranscription: false, meetingProtocol: { pseudonymous: false, paused: false } })
      );

      const state = reducer(withProtocol, transcriptionModesUpdated({ liveTranscription: false }));

      expect(state.meetingProtocol).toBeNull();
    });

    it('restores the modes from the join success payload', () => {
      const state = reducer(
        undefined,
        joinSuccess({
          transcription: {
            status: TranscriptionStatus.Running,
            liveTranscription: false,
            meetingProtocol: { pseudonymous: true, paused: true, consents: false },
          },
        } as JoinSuccessInternalState)
      );

      expect(state.status).toBe(TranscriptionStatus.Running);
      expect(state.liveTranscription).toBe(false);
      expect(state.meetingProtocol).toEqual({ pseudonymous: true, paused: true });
    });

    it('resets the modes when joining without transcription state', () => {
      const withModes = reducer(
        undefined,
        transcriptionModesUpdated({ liveTranscription: true, meetingProtocol: { pseudonymous: false, paused: false } })
      );

      const state = reducer(withModes, joinSuccess({} as JoinSuccessInternalState));

      expect(state.status).toBe(TranscriptionStatus.Inactive);
      expect(state.liveTranscription).toBe(false);
      expect(state.meetingProtocol).toBeNull();
    });
  });

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

    const newState = reducer(stateWithExpiredAndValidSegment, removeExpiredSegments(new Date().toISOString()));

    expect(newState.segments).toHaveLength(1);
    expect(newState.segments[0]).toEqual(validSegment);
  });
});
