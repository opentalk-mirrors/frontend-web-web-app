// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import log from '../../logger';
import type { AppDispatch } from '../../store';
import * as breakoutStore from '../../store/slices/breakoutSlice';
import { patch } from '../../store/slices/participantsSlice';
import { Timestamp } from '../../types';
import { breakout } from '../types/incoming';
import { showErrorNotification } from './helpers';

/**
 * Handles messages in the breakout namespace.
 */
export const handleBreakoutMessage = (dispatch: AppDispatch, data: breakout.Message, timestamp: Timestamp) => {
  switch (data.message) {
    case 'started':
      dispatch(breakoutStore.started(data));
      break;
    // time to manual send switch room command (stop action + delay)
    case 'close_notice':
      break;
    // room server is closing the breakout rooms (stop action without delay)
    case 'closing':
      dispatch(breakoutStore.setBreakoutLoading(true));
      break;
    case 'closed':
      dispatch(breakoutStore.closed(data));
      break;
    case 'participant_switched_room':
      dispatch(
        patch({
          participantId: data.participantId,
          lastActive: timestamp,
          breakoutRoomId: data.newRoom.id,
        })
      );
      break;
    case 'switched_room':
      dispatch(breakoutStore.switchedRoom(data));
      // dispatch(breakoutJoined({ data, timestamp }));
      break;
    case 'error':
      showErrorNotification(data.error);
      break;
    default: {
      const dataString = JSON.stringify(data, null, 2);
      log.error(`Unknown breakout message type: ${dataString}`);
      throw new Error(`Unknown message type: ${dataString}`);
    }
  }
};
