// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import i18next from 'i18next';

import { notifications } from '../../commonComponents';
import log from '../../logger';
import type { AppDispatch, RootState } from '../../store';
import {
  disableRaisedHands,
  enableRaisedHands,
  forceLowerHand,
  loweredHand,
  raisedHand,
} from '../../store/slices/moderationSlice';
import { patch } from '../../store/slices/participantsSlice';
import { Timestamp } from '../../types';
import { raiseHands } from '../types/incoming';

export const handleRaiseHandsMessage = (
  dispatch: AppDispatch,
  data: raiseHands.Message,
  timestamp: Timestamp,
  state: RootState
) => {
  switch (data.message) {
    case 'raise_hands_disabled':
      notifications.info(i18next.t('turn-handraises-off-notification'));
      dispatch(disableRaisedHands());
      break;
    case 'raise_hands_enabled':
      notifications.info(i18next.t('turn-handraises-on-notification'));
      dispatch(enableRaisedHands());
      break;
    case 'hand_raised': {
      if (state.user.uuid === data.participant) {
        dispatch(raisedHand({ timestamp: new Date().toISOString() }));
      } else {
        dispatch(
          patch({
            participantId: data.participant,
            lastActive: timestamp,
            handIsUp: true,
            handUpdatedAt: timestamp,
          })
        );
      }
      break;
    }
    case 'hand_lowered': {
      if (state.user.uuid === data.participant) {
        dispatch(loweredHand());
      } else {
        dispatch(
          patch({
            participantId: data.participant,
            lastActive: timestamp,
            handIsUp: false,
            handUpdatedAt: timestamp,
          })
        );
      }
      break;
    }
    case 'raised_hand_reset_by_moderator':
      if (state.user.uuid && data.participants.includes(state.user.uuid)) {
        notifications.info(i18next.t('reset-handraises-notification'));
        dispatch(forceLowerHand());
      } else {
        data.participants.forEach((participantId) => {
          dispatch(
            patch({
              participantId,
              lastActive: timestamp,
              handIsUp: false,
              handUpdatedAt: timestamp,
            })
          );
        });
      }
      break;
    case 'error': {
      const error = data.error;
      switch (error) {
        // TODO - handle cases
        default:
          log.error(`Raise Hands Error: ${data}`);
          throw new Error(`Raise Hands Error: ${error}`);
      }
      // break;
    }
    default: {
      const dataString = JSON.stringify(data, null, 2);
      log.error(`Unknown raise hands message type: ${dataString}`);
    }
  }
};
