// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { createEntityAdapter, createSelector, createSlice, EntityState, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../';
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
    setBreakoutLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.loading = payload;
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

export const { started, closing, closeNotice, switchedRoom, closed, setBreakoutLoading } = breakoutSlice.actions;

const breakoutRoomsSelectors = breakoutRooms.getSelectors<RootState>((state) => state.breakout.breakoutRooms);
const rootState = (state: RootState) => state;
export const selectIsActive = (state: RootState) => state.breakout.active;

export const selectCurrentBreakoutRoomId = (state: RootState) => state.breakout.currentBreakoutRoomId;
export const selectBreakoutRoomById = (id: BreakoutRoomId) => (state: RootState) =>
  breakoutRoomsSelectors.selectById(state, id);

export const selectCurrentBreakoutRoom = createSelector(
  [rootState, selectCurrentBreakoutRoomId],
  (state, currentRoomId) => breakoutRoomsSelectors.selectById(state, currentRoomId as BreakoutRoomId)
);

export const selectAllBreakoutRooms = (state: RootState) => breakoutRoomsSelectors.selectAll(state);
export const selectAssignedBreakoutRoomId = (state: RootState) => state.breakout.assignment;
export const selectLastDispatchedActionType = (state: RootState) => state.breakout.action;
export const selectExpiredDate = (state: RootState) => state.breakout.expires;
export const selectBreakoutLoading = (state: RootState) => state.breakout.loading;
export const selectBreakoutStopsAt = (state: RootState) => state.breakout.stopsAt;
export const selectBreakoutClosedAt = (state: RootState) => state.breakout.closedAt;

export const actions = breakoutSlice.actions;

export default breakoutSlice.reducer;
