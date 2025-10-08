// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { notifications } from '../commonComponents';
import type { StartAppListening } from './listenerMiddleware';

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
  startHangUpRejectionListener(startAppListening);
};
