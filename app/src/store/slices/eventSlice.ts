// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

import type { RootState } from '..';
import { LeftReason } from '../../api/types/incoming/control';
import { ParticipantId } from '../../types';
import { setChatSettings } from './chatSlice';
import { join as participantJoin, leave as participantLeave } from './participantsSlice';
import { connectionClosed } from './roomSlice';

export interface RoomEvent {
  id: string;
  timestamp: string;
  target: ParticipantId;
  event: 'joined' | 'left' | 'chat_enabled' | 'chat_disabled';
  reason?: LeftReason;
}

const eventAdapter = createEntityAdapter<RoomEvent, string>({
  selectId: (event) => `${event.target}@${event.id}`,
});

export const eventSlice = createSlice({
  name: 'event',
  initialState: eventAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(participantLeave, (state, { payload: { id, timestamp, reason } }) => {
      eventAdapter.addOne(state, { event: 'left', timestamp, target: id, id: uuidv4(), reason });
    });
    builder.addCase(
      participantJoin,
      (
        state,
        {
          payload: {
            participant: { joinedAt, id },
          },
        }
      ) => {
        eventAdapter.addOne(state, {
          event: 'joined',
          timestamp: joinedAt,
          target: id,
          id: uuidv4(),
        });
      }
    );
    builder.addCase(connectionClosed, (state) => {
      eventAdapter.removeAll(state);
    });
    builder.addCase(setChatSettings, (state, { payload: { id, timestamp, enabled } }) => {
      eventAdapter.addOne(state, {
        event: enabled ? 'chat_enabled' : 'chat_disabled',
        target: id,
        timestamp,
        id: uuidv4(),
      });
    });
  },
});

const eventSelector = eventAdapter.getSelectors<RootState>((state) => state.events);
export const selectAllEvents = (state: RootState) => eventSelector.selectAll(state);

export const actions = eventSlice.actions;

export default eventSlice.reducer;
