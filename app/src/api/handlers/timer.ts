// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import i18next from 'i18next';

import { notifications } from '../../commonComponents';
import log from '../../logger';
import type { AppDispatch } from '../../store';
import { timerStarted, timerStopped, updateParticipantsReady } from '../../store/slices/timerSlice';
import { timer } from '../types/incoming';
import { TimerError } from '../types/incoming/timer';

const handleTimerError = (error: TimerError) => {
  switch (error) {
    case TimerError.InvalidDuration:
      notifications.error(i18next.t('timer-error-invalid-duration'));
      break;
    case TimerError.InsufficientPermissions:
      notifications.error(i18next.t('timer-error-insufficient-permissions'));
      break;
    case TimerError.TimerAlreadyRunning:
      notifications.error(i18next.t('timer-error-already-running'));
      break;
    case TimerError.TimerNotRunning:
      notifications.error(i18next.t('timer-error-not-running'));
      break;
    case TimerError.ReadyCheckNotEnabled:
      notifications.error(i18next.t('timer-error-ready-check-not-enabled'));
      break;
    case TimerError.Internal:
    default:
      notifications.error(i18next.t('timer-error-internal'));
      log.error('Timer error message ', error);
      break;
  }
};

/**
 * Handles timer messages.
 */
export const handleTimerMessage = (dispatch: AppDispatch, data: timer.Message) => {
  switch (data.message) {
    case 'started':
      dispatch(timerStarted(data));
      break;
    case 'stopped':
      dispatch(timerStopped(data));
      break;
    case 'updated_ready_status':
      dispatch(updateParticipantsReady(data));
      break;
    case 'error':
      handleTimerError(data.error);
      break;
    default: {
      const dataString = JSON.stringify(data, null, 2);
      log.error(`Unknown timer message type: ${dataString}`);
      throw new Error(`Unknown message type: ${dataString}`);
    }
  }
};
