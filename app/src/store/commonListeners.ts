// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { saveLocationRedirect } from '@opentalk/redux-oidc';

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

const startSaveLocationRedirectListener = (startAppListening: StartAppListening) =>
  startAppListening({
    actionCreator: saveLocationRedirect,
    effect: (action, listenerApi) => {
      const redirectPath = listenerApi.getState().config.oidcConfig.redirectPath;
      const redirectUrlBlacklist = ['server-issue', redirectPath];
      if (
        action.payload.trim() === '' ||
        redirectUrlBlacklist.some((blacklistedUrl) => action.payload.includes(blacklistedUrl))
      ) {
        return;
      }
      sessionStorage.setItem('saved_location', action.payload);
    },
  });

export const startCommonListeners = (startAppListening: StartAppListening) => {
  startHangUpRejectionListener(startAppListening);
  startSaveLocationRedirectListener(startAppListening);
};
