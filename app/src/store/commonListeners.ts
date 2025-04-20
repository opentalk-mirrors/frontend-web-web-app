// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { notifications } from '../commonComponents';
import { ConnectionState } from '../modules/WebRTC/ConferenceRoom';
import { exitingRoomContext } from './commonActions';
import { hangUp } from './commonActions';
import type { StartAppListening } from './listenerMiddleware';

const startHangUpOnRoomExitListener = (startAppListening: StartAppListening) =>
  startAppListening({
    actionCreator: exitingRoomContext,
    effect: (_, listenerApi) => {
      const connectionState = listenerApi.getState().room.connectionState;
      if (connectionState === ConnectionState.Online) {
        listenerApi.dispatch(hangUp());
      }
    },
  });

const startHangUpRejectionListener = (startAppListening: StartAppListening) =>
  startAppListening({
    type: 'room/hangup/rejected',
    effect: (action: { type: string; error?: { message: string } }) => {
      if (action.error) {
        notifications.error(action.error.message);
      }
    },
  });

export const startCommonListeners = (startAppListening: StartAppListening) => {
  startHangUpOnRoomExitListener(startAppListening);
  startHangUpRejectionListener(startAppListening);
};
