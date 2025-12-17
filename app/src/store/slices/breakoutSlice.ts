// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { createEntityAdapter, createSelector, createSlice, EntityState, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../';
import { Started } from '../../api/types/incoming/breakout';
import { BreakoutRoomId, ParticipantId } from '../../types';
import { joinSuccess, startRoom } from '../commonActions';

export interface Room {
  id: BreakoutRoomId;
  name: string;
}

export interface BreakoutState {
  loading: boolean;
  active: boolean;
  stopped: boolean;
  expired: boolean;
  // Waiting for use to choose one room
  waitForUserSelection: boolean;
  // Overview
  breakoutRooms: EntityState<Room, BreakoutRoomId>;
  inParentRoom: Array<ParticipantId>;
  // Selected breakout room by user
  selectedBreakoutRoom?: BreakoutRoomId;
  //  The room id we got assigned to
  assignment?: BreakoutRoomId;
  // currentBreakoutRoomId
  currentBreakoutRoomId?: BreakoutRoomId;
  // milliseconds since 1970
  stoppedAt?: number;
  // milliseconds since 1970
  startedAt?: number;
  action?: string;
  expires?: string;
}
const breakoutRooms = createEntityAdapter<Room>();

const initialState: BreakoutState = {
  loading: false,
  active: false,
  waitForUserSelection: false,
  stopped: false,
  expired: false,
  breakoutRooms: breakoutRooms.getInitialState(),
  inParentRoom: [],
  currentBreakoutRoomId: undefined,
  assignment: undefined,
};

export const breakoutSlice = createSlice({
  name: 'breakout',
  initialState,
  reducers: {
    started: (state, { payload, type }: PayloadAction<Omit<Started, 'message'>>) => {
      state.action = type;
      state.expires = payload.expires;
      state.loading = true;
      state.stopped = false;
      state.expired = false;
      state.active = true;
      if (payload.assignment === null) {
        state.waitForUserSelection = true;
      } else {
        state.loading = true;
      }
      const rooms: Array<Room> = payload.rooms;
      breakoutRooms.setAll(state.breakoutRooms, rooms);
      state.startedAt = Date.now();
      state.assignment = payload.assignment === undefined ? undefined : payload.assignment;
    },
    selected: (state, action: PayloadAction<BreakoutRoomId>) => {
      state.selectedBreakoutRoom = action.payload;
      state.loading = true;
    },
    stopped: (state, { type }) => {
      state.action = type;
      state.loading = true;
      state.active = false;
      state.stopped = true;
      state.stoppedAt = Date.now();
    },
    expired: (state, { type }: PayloadAction<undefined>) => {
      state.action = type;
      state.loading = true;
      state.active = false;
      state.expired = true;
      state.stoppedAt = Date.now();
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
      if (payload.breakout !== undefined && payload.breakout.room.id !== null) {
        breakoutRooms.upsertMany(state.breakoutRooms, payload.breakout.rooms);
        state.currentBreakoutRoomId = payload.breakout.room.id ?? undefined;
        state.stopped = false;
        state.expired = false;
      }
    });
  },
});

export const { started, selected, stopped, expired } = breakoutSlice.actions;

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

export const actions = breakoutSlice.actions;

export default breakoutSlice.reducer;
