// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SnackbarKey } from 'notistack';

import { MINUTE_MS } from '../../../../../utils/timeFormatUtils';
import { sleep } from '../../../../../utils/timeUtils';
import { DEFAULT_AUTO_HIDE_DURATION, notifications } from '../../utils';

let showFirstNotificationTimer: ReturnType<typeof setTimeout>;
let triggerFollowingNotificationTimer: ReturnType<typeof setInterval>;

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
export const startTimeLimitNotification = (conferenceEndTimestamp: string) => {
  let remainingNotificationMinutes: number;
  let showFirstNotificationInMs: number;
  let timeLimitSnackBarKey: SnackbarKey;

  const updateNotification = async (minutes: number) => {
    if (timeLimitSnackBarKey) {
      notifications.close(timeLimitSnackBarKey);
      console.debug(`Closed snackbar ${timeLimitSnackBarKey}`);

      // we must wait between closing a snackbar and opening a new one
      // race condition in the notistack? Anyway, maybe even better from the UX point of view
      await sleep(DELAY_BETWEEN_SNACKBARS);
    }

    timeLimitSnackBarKey = notifications.toast('', {
      variant: 'timeLimit',
      ariaLive: 'polite',
      persist: true,
      minutes,
      autoHideDuration: DEFAULT_AUTO_HIDE_DURATION,
    });
  };

  const handleMinutesUpdate = () => {
    if (remainingNotificationMinutes > 0) {
      --remainingNotificationMinutes;
      updateNotification(remainingNotificationMinutes);
    } else {
      stopTimeLimitNotification();
    }
  };

  const conferenceEndDate = new Date(conferenceEndTimestamp);
  const remainingTimeOfConferenceMs = conferenceEndDate.getTime() - Date.now();
  const remainingTimeOfConferenceMinutes = Math.ceil(remainingTimeOfConferenceMs / MINUTE_MS);
  const doesNotificationTimeslotAlreadyStarted = remainingTimeOfConferenceMinutes <= MINUTES_BEFORE_CONFERENCE_END;
  if (doesNotificationTimeslotAlreadyStarted) {
    remainingNotificationMinutes = remainingTimeOfConferenceMinutes;
    updateNotification(remainingTimeOfConferenceMinutes);
    showFirstNotificationInMs =
      remainingTimeOfConferenceMs - Math.floor(remainingTimeOfConferenceMs / MINUTE_MS) * MINUTE_MS;
  } else {
    remainingNotificationMinutes = MINUTES_BEFORE_CONFERENCE_END + 1;
    showFirstNotificationInMs = remainingTimeOfConferenceMs - MINUTES_BEFORE_CONFERENCE_END * MINUTE_MS;
  }

  showFirstNotificationTimer = setTimeout(() => {
    handleMinutesUpdate();
    triggerFollowingNotificationTimer = setInterval(() => {
      handleMinutesUpdate();
    }, MINUTE_MS);
  }, showFirstNotificationInMs);
};

export const stopTimeLimitNotification = () => {
  clearTimeout(showFirstNotificationTimer);
  clearTimeout(triggerFollowingNotificationTimer);
};
