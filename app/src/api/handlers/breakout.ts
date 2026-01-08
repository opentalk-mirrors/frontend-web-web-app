// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { setLibravatarOptions } from '../../commonComponents';
import log from '../../logger';
import type { AppDispatch, RootState } from '../../store';
import * as breakoutStore from '../../store/slices/breakoutSlice';
import { selectLibravatarDefaultImage } from '../../store/slices/configSlice';
import { breakoutJoined, breakoutLeft } from '../../store/slices/participantsSlice';
import { Timestamp } from '../../types';
import { breakout } from '../types/incoming';
import { showErrorNotification } from './helpers';

/**
 * Handles messages in the breakout namespace.
 */
export const handleBreakoutMessage = (
  dispatch: AppDispatch,
  state: RootState,
  data: breakout.Message,
  timestamp: Timestamp
) => {
  switch (data.message) {
    case 'started':
      dispatch(breakoutStore.started(data));
      break;
    case 'stopped':
      dispatch(breakoutStore.stopped(data));
      break;
    case 'expired':
      dispatch(breakoutStore.expired());
      break;
    case 'joined':
      {
        const modifiedData = {
          ...data,
          avatarUrl: setLibravatarOptions(data.avatarUrl, { defaultImage: selectLibravatarDefaultImage(state) }),
        };
        dispatch(breakoutJoined({ data: modifiedData, timestamp }));
      }
      break;
    case 'left':
      dispatch(breakoutLeft({ id: data.id, timestamp }));
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
