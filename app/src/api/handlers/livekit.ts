// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import i18next from 'i18next';

import { notifications } from '../../commonComponents';
import log from '../../logger';
import type { AppDispatch, RootState } from '../../store';
import { changeMedia } from '../../store/commonActions';
import {
  setLivekitPopoutStreamAccessToken,
  setNewAccessToken,
  triggerLivekitReconnect,
} from '../../store/slices/livekitSlice';
import * as mediaStore from '../../store/slices/mediaSlice';
import { forceMuteDisabled, forceMuteEnabled } from '../../store/slices/moderationSlice';
import { livekit } from '../types/incoming';

/**
 * Handles messages in the livekit namespace.
 */
export const handleLivekitMessage = (dispatch: AppDispatch, data: livekit.Message, state: RootState) => {
  switch (data.message) {
    case 'microphone_restrictions_enabled':
      dispatch(forceMuteEnabled({ unrestrictedParticipants: data.unrestrictedParticipants }));
      if (state.user.uuid !== null && !data.unrestrictedParticipants.includes(state.user.uuid)) {
        notifications.info(i18next.t('microphones-disabled-notification'));
      }
      break;
    case 'microphone_restrictions_disabled':
      dispatch(forceMuteDisabled());
      if (state.user.uuid && !state.moderation.forceMute.unrestrictedParticipants.includes(state.user.uuid)) {
        notifications.info(i18next.t('microphones-enabled-notification'));
      }
      break;
    case 'popout_stream_access_token': {
      dispatch(setLivekitPopoutStreamAccessToken(data.token));
      return;
    }
    case 'credentials': {
      dispatch(setNewAccessToken(data));
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
