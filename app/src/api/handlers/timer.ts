// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import log from '../../logger';
import type { AppDispatch } from '../../store';
import { timerStarted, timerStopped, updateParticipantsReady } from '../../store/slices/timerSlice';
import { timer } from '../types/incoming';

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
    default: {
      const dataString = JSON.stringify(data, null, 2);
      log.error(`Unknown timer message type: ${dataString}`);
      throw new Error(`Unknown message type: ${dataString}`);
    }
  }
};
