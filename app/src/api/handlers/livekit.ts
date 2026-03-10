// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import log from '../../logger';
import type { AppDispatch } from '../../store';
import {
  setLivekitPopoutStreamAccessToken,
  setNewAccessToken,
  triggerLivekitReconnect,
} from '../../store/slices/livekitSlice';
import { livekit } from '../types/incoming';

/**
 * Handles messages in the livekit namespace.
 */
export const handleLivekitMessage = (dispatch: AppDispatch, data: livekit.Message) => {
  switch (data.message) {
    case 'popout_stream_access_token': {
      dispatch(setLivekitPopoutStreamAccessToken(data.token));
      return;
    }
    case 'credentials': {
      dispatch(setNewAccessToken(data));
      return;
    }
    case 'screen_share_permissions_updated': {
      // Permission management is handled by livekit, so we don't need to do anything here
      return;
    }
    case 'error': {
      const error = data.error;
      switch (error) {
        case 'livekit_unavailable':
          dispatch(triggerLivekitReconnect());
          break;
        default:
          log.error(`Livekit Error: ${data}`);
          throw new Error(`Livekit Error: ${error}`);
      }
      break;
    }
    default: {
      const dataString = JSON.stringify(data, null, 2);
      log.error(`Unknown livekit message type: ${dataString}`);
      throw new Error(`Unknown message type: ${dataString}`);
    }
  }
};
