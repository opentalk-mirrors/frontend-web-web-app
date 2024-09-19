// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
// Redux has limitations with non-serializable data, like the LiveKit room object, as it can cause issues with state persistence.
// We've decided to use a separate slice and declare an exception in the store for now.
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Room } from 'livekit-client';

import { AppDispatch, RootState } from '../';
import { hangUp, joinSuccess } from '../commonActions';

let room: Room;

export const setLivekitRoom = (newRoom: Room) => {
  room = newRoom;
};

export const getLivekitRoom = (dispatch?: AppDispatch): Room => {
  if (!room) {
    if (dispatch) {
      dispatch(setLivekitUnavailable(true));
    }
    throw Error('[LiveKit]: Room was not set');
  }

  return room;
};

interface LivekitState {
  unavailable: boolean;
  accessToken: string | undefined;
  publicUrl: string | undefined;
}

const initialState: LivekitState = {
  unavailable: false,
  accessToken: undefined,
  publicUrl: undefined,
};

export const livekitSlice = createSlice({
  name: 'livekit',
  initialState,
  reducers: {
    setLivekitUnavailable: (state, { payload }: PayloadAction<boolean>) => {
      state.unavailable = payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(joinSuccess, (state, { payload }) => {
      state.accessToken = payload.livekit?.token;
      state.publicUrl = payload.livekit?.publicUrl;
    });
    builder.addCase(hangUp.fulfilled, (state) => {
      state.accessToken = undefined;
    });
    builder.addCase(hangUp.rejected, (state) => {
      state.accessToken = undefined;
    });
  },
});

export const { setLivekitUnavailable } = livekitSlice.actions;

export const selectLivekitUnavailable = (state: RootState) => state.livekit.unavailable;
export const selectLivekitAccessToken = (state: RootState) => state.livekit.accessToken;
export const selectLivekitPublicUrl = (state: RootState) => state.livekit.publicUrl;

export default livekitSlice.reducer;
