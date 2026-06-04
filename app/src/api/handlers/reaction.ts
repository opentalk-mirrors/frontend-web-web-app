// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import log from '../../logger';
import type { AppDispatch } from '../../store';
import { reacted, reactionRestrictionsDisabled, reactionRestrictionsEnabled } from '../../store/slices/reactionSlice';
import { reaction } from '../types/incoming';

/**
 * Handles reaction messages.
 */
export const handleReactionMessage = (dispatch: AppDispatch, data: reaction.Message) => {
  switch (data.message) {
    case 'reacted':
      dispatch(reacted(data));
      break;
    case 'restrictions_enabled':
      dispatch(reactionRestrictionsEnabled({ unrestrictedParticipants: data.unrestrictedParticipants }));
      break;
    case 'restrictions_disabled':
      dispatch(reactionRestrictionsDisabled());
      break;
    case 'error':
      log.error(`Reaction error: ${data.error}`);
      break;
    default: {
      const dataString = JSON.stringify(data, null, 2);
      log.error(`Unknown reaction message type: ${dataString}`);
    }
  }
};
