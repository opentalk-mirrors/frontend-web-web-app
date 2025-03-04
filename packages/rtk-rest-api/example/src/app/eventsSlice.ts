// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';

import { Event } from '../../../dist/esm';
import { eventMockedData } from '../mocks/data';
import type { RootState } from './store';

const eventAdapter = createEntityAdapter<Event>({
  selectId: (event) => `${event.id}@${event.title}`,
});

const initialState = eventAdapter.getInitialState();
const preloadState = eventAdapter.addOne(initialState, eventMockedData as Event);
export const eventSlice = createSlice({
  name: 'event',
  initialState: preloadState,
  reducers: {
    addMeeting: (state, { payload }) => {
      eventAdapter.addOne(state, payload);
    },
  },
});

export const { addMeeting } = eventSlice.actions;
const eventSelector = eventAdapter.getSelectors<RootState>((state) => state.events);
export const selectAllEvents = (state: RootState) => eventSelector.selectAll(state);
export default eventSlice.reducer;
