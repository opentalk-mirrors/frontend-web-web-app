// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit';

import type { RootState } from '../';
import { TranscriptionStatus, TranscriptionSegment } from '../../api/types/incoming/transcription';
import { TRANSCRIPTION_SEGMENT_HISTORY_LIMIT, TRANSCRIPTION_SEGMENT_EXPIRATION_TIME_MS } from '../../constants';
import i18n from '../../i18n';
import { hangUp, joinSuccess } from '../commonActions';
import type { StartAppListening } from '../listenerMiddleware';
import { selectBreakoutRoomSelectorParticipants } from '../selectors';

export enum TranscriptionLanguage {
  de = 'Deutsch',
  en = 'English',
}

export interface TranscriptionState {
  status: TranscriptionStatus;
  showSubtitles: boolean;
  showSettings: boolean;
  language: keyof typeof TranscriptionLanguage | null;
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
  language: null,
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
    removeExpiredSegments: (state, { payload }: PayloadAction<Date>) => {
      const now = payload;
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
    setTranscriptionLanguage: (state, { payload }: PayloadAction<keyof typeof TranscriptionLanguage>) => {
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
export const selectLanguage = (state: RootState) => state.transcription.language;
export const selectSegmentsSortedByTimestamp = createSelector([selectSegments], (segments) => {
  return [...segments].sort((a, b) => new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime());
});

const startLanguageChangeListener = (startAppListening: StartAppListening) => {
  startAppListening({
    actionCreator: setTranscriptionLanguage,
    effect: (action) => {
      const newLanguage = action.payload;
      localStorage.setItem('transcription-language', newLanguage);
    },
  });
};
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

export function loadTranscriptionLanguageFromLocalStorage(): keyof typeof TranscriptionLanguage | null {
  const language_str = localStorage.getItem('transcription-language');
  if ((language_str || []).length > 0) {
    return language_str as keyof typeof TranscriptionLanguage;
  }
  return null;
}

export const startTranscriptionSliceListeners = (startAppListening: StartAppListening) => {
  startLanguageChangeListener(startAppListening);
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
