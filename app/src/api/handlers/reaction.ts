// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import i18next from 'i18next';

import { notifications } from '../../commonComponents';
import log from '../../logger';
import type { AppDispatch } from '../../store';
import { reacted, reactionRestrictionsDisabled, reactionRestrictionsEnabled } from '../../store/slices/reactionSlice';
import { Timestamp } from '../../types';
import { reaction } from '../types/incoming';

/**
 * Handles reaction messages.
 */
export const handleReactionMessage = (dispatch: AppDispatch, data: reaction.Message, timestamp: Timestamp) => {
  switch (data.message) {
    case 'reacted':
      dispatch(reacted({ timestamp, participantId: data.participantId, reaction: data.reaction }));
      break;
    case 'restrictions_enabled':
      notifications.info(i18next.t('reaction-disabled-message'));
      dispatch(reactionRestrictionsEnabled({ unrestrictedParticipants: data.unrestrictedParticipants }));
      break;
    case 'restrictions_disabled':
      notifications.info(i18next.t('reaction-enabled-message'));
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
