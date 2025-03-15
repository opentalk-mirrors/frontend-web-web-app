// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { createAction } from '@reduxjs/toolkit';
import { Room } from 'livekit-client';

import type { AppDispatch } from '.';

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

export const setLivekitUnavailable = createAction<boolean>('livekit/set_livekit_unavailable');
