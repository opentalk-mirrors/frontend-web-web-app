// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { RoomId } from '@opentalk/rest-api-rtk-query';
import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';

import { BreakoutError } from '../../api/types/incoming/breakout';
import { abortWhiteboardRoomSwitch, endWhiteboardRoomSwitch } from '../../modules/WhiteboardRoomSwitch';
import { startRoom } from '../commonActions';
import { breakoutError } from './breakoutSlice';
import roomReducer, { connectionClosed, startRoomListeners } from './roomSlice';

vi.mock('../../modules/WhiteboardRoomSwitch', () => ({
  abortWhiteboardRoomSwitch: vi.fn(),
  endWhiteboardRoomSwitch: vi.fn(),
}));

describe('roomSlice listeners', () => {
  it('aborts a pending whiteboard room switch when the breakout request fails', async () => {
    const listenerMiddleware = createListenerMiddleware();
    startRoomListeners(listenerMiddleware.startListening as never);
    const store = configureStore({
      reducer: { room: roomReducer },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(listenerMiddleware.middleware),
    });

    store.dispatch(breakoutError(BreakoutError.UnknownBreakoutId));
    await Promise.resolve();

    expect(abortWhiteboardRoomSwitch).toHaveBeenCalledOnce();
  });

  it('resets the whiteboard room switch when the room connection closes or starts', async () => {
    const listenerMiddleware = createListenerMiddleware();
    startRoomListeners(listenerMiddleware.startListening as never);
    const store = configureStore({
      reducer: { room: roomReducer },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(listenerMiddleware.middleware),
    });

    store.dispatch(connectionClosed({ errorCode: 1006 }));
    store.dispatch(
      startRoom.pending('request-id', {
        roomId: 'room-id' as RoomId,
        displayName: 'Display Name',
      })
    );
    await Promise.resolve();

    expect(endWhiteboardRoomSwitch).toHaveBeenCalledTimes(2);
  });
});
