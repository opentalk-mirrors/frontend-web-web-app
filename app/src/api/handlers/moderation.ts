// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import i18next from 'i18next';

import { notifications, setLibravatarOptions } from '../../commonComponents';
import log from '../../logger';
import type { AppDispatch, RootState } from '../../store';
import { hangUp } from '../../store/commonActions';
import { selectLibravatarDefaultImage } from '../../store/slices/configSlice';
import { disableRaisedHands, enableRaisedHands, forceLowerHand } from '../../store/slices/moderationSlice';
import { rename as participantsRename, waitingRoomJoined, waitingRoomLeft } from '../../store/slices/participantsSlice';
import { disableWaitingRoom, enableWaitingRoom, enteredWaitingRoom, readyToEnter } from '../../store/slices/roomSlice';
import { setDisplayName } from '../../store/slices/userSlice';
import { Role } from '../../types';
import { moderation } from '../types/incoming';

/**
 * Handles messages in the moderation namespace.
 */
export const handleModerationMessage = (dispatch: AppDispatch, data: moderation.Message, state: RootState) => {
  switch (data.message) {
    case 'kicked':
      dispatch(hangUp());
      notifications.warning(i18next.t('meeting-notification-kicked'));
      break;
    case 'banned':
      dispatch(hangUp());
      notifications.warning(i18next.t('meeting-notification-banned'));
      break;
    case 'sent_to_waiting_room': {
      dispatch(enteredWaitingRoom());
      notifications.warning(i18next.t('meeting-notification-moved-to-waiting-room'));
      break;
    }
    case 'waiting_room_enabled':
      dispatch(enableWaitingRoom());
      break;
    case 'waiting_room_disabled':
      dispatch(disableWaitingRoom());
      break;
    case 'joined_waiting_room':
      {
        const modifiedData = {
          ...data,
          control: {
            ...data.control,
            avatarUrl: setLibravatarOptions(data.control.avatarUrl, {
              defaultImage: selectLibravatarDefaultImage(state),
            }),
          },
        };
        dispatch(waitingRoomJoined(modifiedData));
      }
      break;
    case 'left_waiting_room':
      dispatch(waitingRoomLeft(data.id));
      break;
    case 'in_waiting_room':
      dispatch(enteredWaitingRoom());
      break;
    case 'accepted':
      dispatch(readyToEnter());
      break;
    case 'raised_hand_reset_by_moderator':
      notifications.info(i18next.t('reset-handraises-notification'));
      dispatch(forceLowerHand());
      break;
    case 'raise_hands_disabled':
      notifications.info(i18next.t('turn-handraises-off-notification'));
      dispatch(forceLowerHand());
      dispatch(disableRaisedHands());
      break;
    case 'raise_hands_enabled':
      notifications.info(i18next.t('turn-handraises-on-notification'));
      dispatch(enableRaisedHands());
      break;
    case 'debriefing_started':
      notifications.info(i18next.t('debriefing-started-notification'));
      break;
    case 'session_ended':
      dispatch(hangUp());
      notifications.info(
        i18next.t(
          state.user.role === Role.Moderator
            ? 'debriefing-session-ended-for-all-notification'
            : 'debriefing-session-ended-notification'
        )
      );
      break;
    case 'display_name_changed':
      dispatch(participantsRename({ id: data.target, displayName: data.newName }));
      if (data.target === state.user.uuid) {
        dispatch(setDisplayName(data.newName));
      }
      notifications.info(
        i18next.t('display-name-change-notification', {
          moderatorName: state.participants.entities[data.issued_by]?.displayName || '',
          oldName: data.oldName,
          newName: data.newName,
        })
      );
      break;
    default: {
      const dataString = JSON.stringify(data, null, 2);
      log.error(`Unknown moderation message type: ${dataString}`);
      throw new Error(`Unknown message type: ${dataString}`);
    }
  }
};
