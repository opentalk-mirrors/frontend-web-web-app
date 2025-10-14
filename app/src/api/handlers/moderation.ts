// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import i18next from 'i18next';

import { notifications } from '../../commonComponents';
import log from '../../logger';
import type { AppDispatch, RootState } from '../../store';
import { hangUp } from '../../store/commonActions';
import { rename as participantsRename, patch } from '../../store/slices/participantsSlice';
import { disableWaitingRoom, enableWaitingRoom, enteredWaitingRoom, readyToEnter } from '../../store/slices/roomSlice';
import { setDisplayName, updateRole } from '../../store/slices/userSlice';
import { Role, Timestamp } from '../../types';
import { moderation } from '../types/incoming';
import { forceMuteDisabled, forceMuteEnabled } from '../../store/slices/moderationSlice';

/**
 * Handles messages in the moderation namespace.
 */
export const handleModerationMessage = (
  dispatch: AppDispatch,
  data: moderation.Message,
  timestamp: Timestamp,
  state: RootState
) => {
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
    case 'accepted':
      dispatch(readyToEnter());
      break;
    case 'debriefing_started':
      notifications.info(i18next.t('debriefing-started-notification'));
      break;
    // case 'session_ended':
    //   dispatch(hangUp());
    //   notifications.info(
    //     i18next.t(
    //       state.user.role === Role.Moderator
    //         ? 'debriefing-session-ended-for-all-notification'
    //         : 'debriefing-session-ended-notification'
    //     )
    //   );
    //   break;
    case 'display_name_changed':
      dispatch(participantsRename({ id: data.target, displayName: data.newName }));
      if (data.target === state.user.uuid) {
        dispatch(setDisplayName(data.newName));
      }
      notifications.info(
        i18next.t('display-name-change-notification', {
          moderatorName: state.participants.entities[data.issuedBy]?.displayName || '',
          oldName: data.oldName,
          newName: data.newName,
        })
      );
      break;
    case 'muted': {
      const participants = state.participants.entities;
      notifications.warning(
        i18next.t('media-received-force-mute', { origin: participants[data.moderator]?.displayName || 'admin' })
      );
      return;
    }
    case 'role_updated':
      if (data.participantId === state.user.uuid) {
        dispatch(updateRole(data.newRole));
        if (data.newRole === Role.Moderator) {
          notifications.info(i18next.t('moderation-rights-granted'));
        } else {
          notifications.warning(i18next.t('moderation-rights-revoked'));
        }
      } else {
        dispatch(
          patch({
            participantId: data.participantId,
            lastActive: timestamp,
            role: data.newRole,
          })
        );
      }
      break;
    case 'participant_accepted':
      break;
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
    default: {
      const dataString = JSON.stringify(data, null, 2);
      log.error(`Unknown moderation message type: ${dataString}`);
      throw new Error(`Unknown message type: ${dataString}`);
    }
  }
};
