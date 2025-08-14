// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { createListenerMiddleware, TypedStartListening } from '@reduxjs/toolkit';

import { startCommonListeners } from './commonListeners';
import type { RootState, AppDispatch } from './index';
import { startLivekitListeners } from './slices/livekitSlice';
import { startParticipantsListeners } from './slices/participantsSlice';
import { startRoomListeners } from './slices/roomSlice';
import { startTimerListeners } from './slices/timerSlice';
import { startUserListeners } from './slices/userSlice';

export const listenerMiddleware = createListenerMiddleware();

export type StartAppListening = TypedStartListening<RootState, AppDispatch>;

const startAppListening = listenerMiddleware.startListening.withTypes<RootState, AppDispatch>();

const startListening = () => {
  startCommonListeners(startAppListening);
  startLivekitListeners(startAppListening);
  startTimerListeners(startAppListening);
  startParticipantsListeners(startAppListening);
  startRoomListeners(startAppListening);
  startUserListeners(startAppListening);
};

startListening();
