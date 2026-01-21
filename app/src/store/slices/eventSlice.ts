// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { createEntityAdapter, createSlice, isAnyOf } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

import type { RootState } from '..';
import { DisconnectReason } from '../../api/types/incoming/core';
import { ParticipantId } from '../../types';
import { setChatSettings } from './chatSlice';
import { participantJoined, participantLeft, participantRejoined } from './participantsSlice';
import { connectionClosed } from './roomSlice';

export interface RoomEvent {
  id: string;
  timestamp: string;
  target: ParticipantId;
  event: 'joined' | 'left' | 'chat_enabled' | 'chat_disabled';
  reason?: DisconnectReason;
}

const eventAdapter = createEntityAdapter<RoomEvent, string>({
  selectId: (event) => `${event.target}@${event.id}`,
});

export const eventSlice = createSlice({
  name: 'event',
  initialState: eventAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      participantLeft,
      (
        state,
        {
          payload: {
            participant: { leftAt, id },
            reason,
          },
        }
      ) => {
        eventAdapter.addOne(state, {
          event: 'left',
          timestamp: leftAt || new Date().toISOString(),
          target: id,
          id: uuidv4(),
          reason: reason || DisconnectReason.Leave,
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
    builder.addMatcher(isAnyOf(participantJoined, participantRejoined), (state, action) => {
      const { id, joinedAt } = action.payload.participant;
      eventAdapter.addOne(state, {
        event: 'joined',
        timestamp: joinedAt,
        target: id,
        id: uuidv4(),
      });
    });
  },
});

const eventSelector = eventAdapter.getSelectors<RootState>((state) => state.events);
export const selectAllEvents = (state: RootState) => eventSelector.selectAll(state);

export const actions = eventSlice.actions;

export default eventSlice.reducer;
