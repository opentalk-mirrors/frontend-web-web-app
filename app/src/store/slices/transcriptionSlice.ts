// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit';

import type { RootState } from '../';
import {
  TranscriptionStatus,
  TranscriptionSegment,
  TranscriptionLanguageKey,
} from '../../api/types/incoming/transcription';
import { TRANSCRIPTION_SEGMENT_HISTORY_LIMIT, TRANSCRIPTION_SEGMENT_EXPIRATION_TIME_MS } from '../../constants';
import i18n from '../../i18n';
import { hangUp, joinSuccess } from '../commonActions';
import type { StartAppListening } from '../listenerMiddleware';
import { selectBreakoutRoomSelectorParticipants } from '../selectors';

export interface TranscriptionState {
  status: TranscriptionStatus;
  showSubtitles: boolean;
  showSettings: boolean;
  language: TranscriptionLanguageKey | '';
  segments: TranscriptionSegment[];
}

export interface TranscriptionSubtitle {
  displayName: string;
  text: string;
  timestamp: string;
  avatarUrl?: string;
}

const initialState: TranscriptionState = {
  status: TranscriptionStatus.Inactive,
  showSubtitles: false,
  showSettings: false,
  language: '',
  segments: [],
};

const transcriptionSlice = createSlice({
  name: 'transcription',
  initialState,
  reducers: {
    transcriptionStatusUpdated: (state, { payload }: PayloadAction<TranscriptionStatus>) => {
      state.status = payload;
    },
    segmentReceived: (state, { payload }: PayloadAction<TranscriptionSegment>) => {
      state.segments.push(payload);
      if (state.segments.length > TRANSCRIPTION_SEGMENT_HISTORY_LIMIT) {
        state.segments.shift();
      }
    },
    removeExpiredSegments: (state, { payload }: PayloadAction<string>) => {
      const now = new Date(payload);
      state.segments = state.segments.filter((segment) => {
        const segmentEndTime = new Date(segment.endsAt);
        return now.getTime() - segmentEndTime.getTime() < TRANSCRIPTION_SEGMENT_EXPIRATION_TIME_MS;
      });
    },
    showSubtitles: (state) => {
      state.showSubtitles = true;
    },
    hideSubtitles: (state) => {
      state.showSubtitles = false;
    },
    setTranscriptionLanguage: (state, { payload }: PayloadAction<TranscriptionLanguageKey>) => {
      state.language = payload;
    },
    showTranscriptionSettings: (state) => {
      state.showSettings = true;
    },
    hideTranscriptionSettings: (state) => {
      state.showSettings = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(joinSuccess, (state, { payload }) => {
      if (payload.transcription) {
        state.status = payload.transcription.status;
      } else {
        state.status = TranscriptionStatus.Inactive;
      }
    });
    builder.addCase(hangUp.pending, () => initialState);
  },
});

export const {
  transcriptionStatusUpdated,
  segmentReceived,
  removeExpiredSegments,
  showSubtitles,
  hideSubtitles,
  setTranscriptionLanguage,
  showTranscriptionSettings,
  hideTranscriptionSettings,
} = transcriptionSlice.actions;

export const selectTranscriptionStatus = (state: RootState) => state.transcription.status;
export const selectSegments = (state: RootState) => state.transcription.segments;
export const selectShowSubtitles = (state: RootState) => state.transcription.showSubtitles;
export const selectShowSubtitlesSettings = (state: RootState) => state.transcription.showSettings;
export const selectTranscriptionLanguage = (state: RootState) => state.transcription.language;
export const selectSegmentsSortedByTimestamp = createSelector([selectSegments], (segments) => {
  return [...segments].sort((a, b) => new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime());
});

const startLanguageRestoreListener = (startAppListening: StartAppListening) => {
  startAppListening({
    actionCreator: joinSuccess,
    effect: (_, listenerApi) => {
      const transcriptionLanguage = loadTranscriptionLanguageFromLocalStorage();
      if (transcriptionLanguage) {
        listenerApi.dispatch(setTranscriptionLanguage(transcriptionLanguage));
      }
    },
  });
};

export function loadTranscriptionLanguageFromLocalStorage(): TranscriptionLanguageKey | null {
  const language_str = localStorage.getItem('transcription-language');
  if ((language_str || []).length > 0) {
    return language_str as TranscriptionLanguageKey;
  }
  return null;
}

export function saveTranscriptionLanguageToLocalStorage(language: TranscriptionLanguageKey): void {
  localStorage.setItem('transcription-language', language);
}

export const startTranscriptionSliceListeners = (startAppListening: StartAppListening) => {
  startLanguageRestoreListener(startAppListening);
};
export const selectSubtitles = createSelector(
  [selectSegmentsSortedByTimestamp, (state: RootState) => state],
  (segments, state) => {
    return segments.map((segment: TranscriptionSegment): TranscriptionSubtitle => ({
      displayName:
        selectBreakoutRoomSelectorParticipants(state).find((participant) => participant.id === segment.participantId)
          ?.displayName || i18n.t('global-unknown-username'),
      text: segment.text,
      timestamp: segment.endsAt,
      avatarUrl: selectBreakoutRoomSelectorParticipants(state).find(
        (participant) => participant.id === segment.participantId
      )?.avatarUrl,
    }));
  }
);

export const selectIsTranscriptionActive = createSelector(
  [selectTranscriptionStatus],
  (status) => status === TranscriptionStatus.Running
);

export default transcriptionSlice.reducer;
