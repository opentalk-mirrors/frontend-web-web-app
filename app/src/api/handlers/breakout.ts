// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import log from '../../logger';
import { endWhiteboardRoomSwitch } from '../../modules/WhiteboardRoomSwitch';
import type { AppDispatch, RootState } from '../../store';
import * as breakoutStore from '../../store/slices/breakoutSlice';
import { patch } from '../../store/slices/participantsSlice';
import { Timestamp } from '../../types';
import { breakout } from '../types/incoming';
import { showErrorNotification } from './helpers';

/**
 * Handles messages in the breakout namespace.
 */
export const handleBreakoutMessage = (
  dispatch: AppDispatch,
  data: breakout.Message,
  timestamp: Timestamp,
  state: RootState
) => {
  switch (data.message) {
    case 'started':
      dispatch(breakoutStore.started(data));
      break;
    // time to manual send switch room command (stop action + delay)
    case 'close_notice':
      dispatch(breakoutStore.closeNotice(data));
      break;
    // room server is closing the breakout rooms (stop action without delay)
    case 'closing':
      dispatch(breakoutStore.closing(data));
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
      // We are in the new room from here on, so drop whatever the whiteboard still
      // has scheduled for the room we just left.
      endWhiteboardRoomSwitch();
      dispatch(breakoutStore.switchedRoom({ ...data, ownParticipantId: state.user.uuid ?? undefined }));
      break;
    case 'error':
      dispatch(breakoutStore.breakoutError(data.error));
      showErrorNotification(data.error);
      break;
    default: {
      const dataString = JSON.stringify(data, null, 2);
      log.error(`Unknown breakout message type: ${dataString}`);
      throw new Error(`Unknown message type: ${dataString}`);
    }
  }
};
