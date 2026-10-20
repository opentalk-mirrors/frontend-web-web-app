// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SnackbarKey } from 'notistack';

import log from '../../../../../logger';
import { MINUTE_MS } from '../../../../../utils/timeFormatUtils';
import { DEFAULT_AUTO_HIDE_DURATION, notifications } from '../../utils';

let notificationTimer: ReturnType<typeof setTimeout> | undefined;
let timeLimitSnackBarKey: SnackbarKey | undefined;

// How many minutes in advance before end of conference we shall start to notify user
// E.g. MINUTES_BEFORE_END = 5 -> first notification will be shown 5 minutes
// before conference will be ended
const MINUTES_BEFORE_CONFERENCE_END = 5;
const DELAY_BETWEEN_SNACKBARS = 1000; //ms

// This function is responsible to notify user, that the conference will end up soon.
// The first notification comes several minutes in advance, which is defined by MINUTES_BEFORE_CONFERENCE_END.
// After first notification has been shown, every minute a new notification shall appear, with a
// new minute number.
// User can close a notification manually, but a new one shall appear after current minute is over.
// Last minute notification shows running seconds and cannot be closed.
export const startTimeLimitNotification = async (conferenceEndTimestamp: string) => {
  stopTimeLimitNotification();

  const conferenceEndTime = new Date(conferenceEndTimestamp).getTime();

  const updateNotification = () => {
    notificationTimer = undefined;

    const remainingTimeMs = conferenceEndTime - Date.now();
    if (!Number.isFinite(remainingTimeMs) || remainingTimeMs <= 0) {
      stopTimeLimitNotification();
      return;
    }

    const minutes = Math.ceil(remainingTimeMs / MINUTE_MS);
    let nextNotificationInMs: number;

    if (minutes > MINUTES_BEFORE_CONFERENCE_END) {
      nextNotificationInMs = remainingTimeMs - MINUTES_BEFORE_CONFERENCE_END * MINUTE_MS;
    } else if (timeLimitSnackBarKey !== undefined) {
      notifications.close(timeLimitSnackBarKey);
      log.debug(`Closed snackbar ${timeLimitSnackBarKey}`);
      timeLimitSnackBarKey = undefined;
      nextNotificationInMs = Math.min(DELAY_BETWEEN_SNACKBARS, remainingTimeMs);
    } else {
      timeLimitSnackBarKey = notifications.toast('', {
        variant: 'timeLimit',
        ariaLive: 'polite',
        persist: true,
        minutes,
        endsAt: conferenceEndTime,
        autoHideDuration: DEFAULT_AUTO_HIDE_DURATION,
      });
      nextNotificationInMs = remainingTimeMs - (minutes - 1) * MINUTE_MS;
    }

    notificationTimer = setTimeout(updateNotification, nextNotificationInMs);
  };

  updateNotification();
};

export const stopTimeLimitNotification = () => {
  clearTimeout(notificationTimer);
  notificationTimer = undefined;

  if (timeLimitSnackBarKey !== undefined) {
    notifications.close(timeLimitSnackBarKey);
    timeLimitSnackBarKey = undefined;
  }
};
