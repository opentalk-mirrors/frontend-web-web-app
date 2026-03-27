// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { createEntityAdapter, createSelector, createSlice, EntityState, PayloadAction } from '@reduxjs/toolkit';

import { CloseNotice, Closing, Started, SwitchedRoom } from '../../api/types/incoming/breakout';
import { BreakoutRoomId, Timestamp } from '../../types';
import { joinSuccess, startRoom } from '../commonActions';

export interface Room {
  id: BreakoutRoomId;
  name: string;
}

export interface BreakoutState {
  loading: boolean;
  active: boolean;
  expired: boolean;
  // Overview
  breakoutRooms: EntityState<Room, BreakoutRoomId>;
  //  The room id we got assigned to
  assignment?: BreakoutRoomId;
  // currentBreakoutRoomId
  currentBreakoutRoomId?: BreakoutRoomId;
  stopsAt?: Timestamp;
  closedAt?: number;
  action?: string;
  expires?: string;
}
const breakoutRooms = createEntityAdapter<Room>();

const initialState: BreakoutState = {
  loading: false,
  active: false,
  expired: false,
  breakoutRooms: breakoutRooms.getInitialState(),
};

export const breakoutSlice = createSlice({
  name: 'breakout',
  initialState,
  reducers: {
    started: (state, { payload, type }: PayloadAction<Omit<Started, 'message'>>) => {
      state.action = type;
      state.expires = payload.expiresAt;
      state.loading = true;
      state.expired = false;
      state.active = true;

      const rooms: Array<Room> = payload.rooms;
      breakoutRooms.setAll(state.breakoutRooms, rooms);
      state.assignment = payload.assignment;
    },
    switchedRoom: (state, { payload, type }: PayloadAction<Omit<SwitchedRoom, 'message'>>) => {
      state.action = type;
      state.loading = false;
      state.currentBreakoutRoomId = payload.newRoom.id;
      state.assignment = payload.newRoom.id;
    },
    closeNotice: (state, { payload, type }: PayloadAction<Omit<CloseNotice, 'message'>>) => {
      state.action = type;
      state.stopsAt = payload.stopsAt;
    },
    closing: (state, { type }: PayloadAction<Omit<Closing, 'message'>>) => {
      state.action = type;
      state.loading = true;
    },
    closed: (state, { type }) => {
      state.action = type;
      state.closedAt = Date.now();
      state.loading = false;
      state.active = false;
      state.currentBreakoutRoomId = undefined;
      state.assignment = undefined;
      state.stopsAt = undefined;
      state.expires = undefined;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(startRoom.pending, (state, { meta: { arg } }) => {
      state.currentBreakoutRoomId = arg.breakoutRoomId;
      state.assignment = arg.breakoutRoomId;
      state.action = undefined;
    });
    builder.addCase(joinSuccess, (state, { payload }) => {
      state.loading = false;
      state.active = payload.breakout !== undefined;
      if (payload.breakout) {
        breakoutRooms.upsertMany(state.breakoutRooms, payload.breakout.rooms);
        state.currentBreakoutRoomId = payload.breakout.room.id;
        state.expired = false;
      }
    });
  },
});

export const { started, closing, closeNotice, switchedRoom, closed } = breakoutSlice.actions;

export const selectBreakoutRooms = (state: { breakout: BreakoutState }) => state.breakout.breakoutRooms;
export const {
  selectById,
  selectEntities: selectBreakoutRoomEntities,
  selectAll: selectAllBreakoutRooms,
} = breakoutRooms.getSelectors(selectBreakoutRooms);
export const selectIsActive = (state: { breakout: BreakoutState }) => state.breakout.active;

export const selectCurrentBreakoutRoomId = (state: { breakout: BreakoutState }) => state.breakout.currentBreakoutRoomId;
export const selectBreakoutRoomById = createSelector(
  [selectBreakoutRoomEntities, (_, id: BreakoutRoomId) => id],
  (breakoutRoomEntities, id) => breakoutRoomEntities[id]
);
export const selectCurrentBreakoutRoom = createSelector(
  [selectCurrentBreakoutRoomId, selectBreakoutRoomEntities],
  (currentRoomId, breakoutRoomEntities) => {
    return currentRoomId !== undefined ? breakoutRoomEntities[currentRoomId] : undefined;
  }
);
export const selectAssignedBreakoutRoomId = (state: { breakout: BreakoutState }) => state.breakout.assignment;
export const selectLastDispatchedActionType = (state: { breakout: BreakoutState }) => state.breakout.action;
export const selectExpiredDate = (state: { breakout: BreakoutState }) => state.breakout.expires;
export const selectBreakoutStopsAt = (state: { breakout: BreakoutState }) => state.breakout.stopsAt;
export const selectBreakoutClosedAt = (state: { breakout: BreakoutState }) => state.breakout.closedAt;
export const actions = breakoutSlice.actions;

export default breakoutSlice.reducer;
