// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { isEmpty } from 'lodash';

import type { RootState } from '..';
import { hangUp } from '../commonActions';

export type MeetingNotesState = {
  meetingNotesUrl: string | null;
};

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
  extraReducers: (builder) => {
    builder.addCase(hangUp.fulfilled, () => initialState);
  },
});

export const { setMeetingNotesReadUrl, setMeetingNotesWriteUrl } = meetingNotesSlice.actions;

const meetingNotesState = (state: RootState) => state.meetingNotes;
export const selectMeetingNotesUrl = createSelector([meetingNotesState], (state) => state.meetingNotesUrl);
export const selectIsMeetingNotesFeatureAvailable = createSelector(
  [selectMeetingNotesUrl],
  (meetingNotesUrl) => !isEmpty(meetingNotesUrl)
);

export default meetingNotesSlice.reducer;
