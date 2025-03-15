// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '..';

interface MeetingNotesState {
  meetingNotesUrl: string | null;
}

const initialState: MeetingNotesState = {
  meetingNotesUrl: null,
};

export const meetingNotesSlice = createSlice({
  name: 'meetingNotes',
  initialState,
  reducers: {
    setMeetingNotesReadUrl: (state, action: PayloadAction<string | null>) => {
      state.meetingNotesUrl = action.payload;
    },
    setMeetingNotesWriteUrl: (state, action: PayloadAction<string | null>) => {
      state.meetingNotesUrl = action.payload;
    },
  },
});

export const { setMeetingNotesReadUrl, setMeetingNotesWriteUrl } = meetingNotesSlice.actions;

const meetingNotesState = (state: RootState) => state.meetingNotes;
export const selectMeetingNotesUrl = createSelector(meetingNotesState, (state) => state.meetingNotesUrl);
export const selectIsMeetingNotesAvailable = createSelector(meetingNotesState, (state) =>
  Boolean(state.meetingNotesUrl)
);

export default meetingNotesSlice.reducer;
