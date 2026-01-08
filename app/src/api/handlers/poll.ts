// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import log from '../../logger';
import type { AppDispatch } from '../../store';
import * as pollStore from '../../store/slices/pollSlice';
import { poll } from '../types/incoming';

/**
 * Handles messages in the poll namespace.
 */
export const handlePollVoteMessage = (dispatch: AppDispatch, data: poll.Message) => {
  switch (data.message) {
    case 'started':
      dispatch(pollStore.started(data));
      break;
    case 'live_update':
      dispatch(pollStore.liveUpdated(data));
      break;
    case 'done':
      dispatch(pollStore.done(data));
      break;
    case 'error':
      // todo error handling in BE seems to be wrong
      log.error('Poll error message', data);
      // dispatchError(data.error.replace('_', '-'));
      break;
    default: {
      const dataString = JSON.stringify(data, null, 2);
      log.error(`Unknown poll message type: ${dataString}`);
      throw new Error(`Unknown message type: ${dataString}`);
    }
  }
};
