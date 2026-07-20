// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import i18next from 'i18next';
import { truncate } from 'lodash';

import { notifications } from '../../commonComponents';
import log from '../../logger';
import type { AppDispatch, RootState } from '../../store';
import { hangUp } from '../../store/commonActions';
import {
  disabledSelfRename,
  enabledSelfRename,
  forceMuteDisabled,
  forceMuteEnabled,
  setDebriefingStarted,
  setGuestAccessEnabled,
  setModeratorData,
  setWaitingRoomState,
} from '../../store/slices/moderationSlice';
import { rename as participantsRename, patch } from '../../store/slices/participantsSlice';
import { enteredWaitingRoom, lobbyDisplayNameAssigned, readyToEnter, setCanEnter } from '../../store/slices/roomSlice';
import { setDisplayName, updateRole } from '../../store/slices/userSlice';
import { KickReason, Role, Timestamp, WaitingRoom } from '../../types';
import { moderation } from '../types/incoming';
import { ModerationError } from '../types/incoming/moderation';

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
    case 'kicked': {
      dispatch(hangUp());
      switch (data.reason) {
        case KickReason.Kicked:
          notifications.warning(i18next.t('meeting-notification-kicked'));
          break;
        case KickReason.Debriefed: {
          const isModerator = state.user.role === Role.Moderator;
          const translationKey = isModerator
            ? 'debriefing-session-ended-for-all-notification'
            : 'debriefing-session-ended-notification';
          notifications.info(i18next.t(translationKey));
          break;
        }
      }
      break;
    }
    case 'banned':
      dispatch(hangUp());
      notifications.warning(i18next.t('meeting-notification-banned'));
      break;
    case 'sent_to_waiting_room': {
      dispatch(enteredWaitingRoom());
      notifications.warning(i18next.t('meeting-notification-moved-to-waiting-room'));
      break;
    }
    case 'waiting_room_updated': {
      dispatch(setWaitingRoomState(data.newState));
      if (state.moderation.debriefingStarted) {
        dispatch(setDebriefingStarted(false));
      } else {
        switch (data.newState) {
          case WaitingRoom.Disabled:
            notifications.info(i18next.t('waiting-room-disabled-message'));
            break;
          case WaitingRoom.ForGuests:
            notifications.info(i18next.t('waiting-room-for-guests-message'));
            break;
          case WaitingRoom.ForEveryone:
            notifications.info(i18next.t('waiting-room-enabled-message'));
            break;
        }
      }
      break;
    }
    case 'guest_access_enabled':
      dispatch(setGuestAccessEnabled(true));
      notifications.info(i18next.t('guest-access-enabled-message'));
      break;
    case 'guest_access_disabled':
      dispatch(setGuestAccessEnabled(false));
      notifications.info(i18next.t('guest-access-disabled-message'));
      break;
    case 'accepted':
      dispatch(readyToEnter());
      break;
    case 'debriefing_started':
      dispatch(setDebriefingStarted(true));
      notifications.info(i18next.t('debriefing-started-notification'));
      break;
    case 'display_name_assigned': {
      dispatch(lobbyDisplayNameAssigned({ displayName: data.newName }));
      break;
    }
    case 'display_name_changed': {
      dispatch(participantsRename({ id: data.target, displayName: data.newName }));
      const isSelf = data.target === state.user.uuid;
      const issuedBySelf = data.issuedBy === state.user.uuid;
      const actorName = state.participants.entities[data.issuedBy]?.displayName ?? 'unknown';

      if (isSelf) {
        dispatch(setDisplayName(data.newName));
      }

      if (issuedBySelf && isSelf) {
        notifications.info(
          i18next.t('rename-self-notification', {
            newName: truncate(data.newName, { length: 100 }),
          })
        );
      } else if (issuedBySelf) {
        notifications.info(
          i18next.t('rename-other-feedback-notification', {
            oldName: truncate(data.oldName, { length: 100 }),
            newName: truncate(data.newName, { length: 100 }),
          })
        );
      } else if (isSelf) {
        notifications.info(
          i18next.t('rename-other-target-notification', {
            actorName: truncate(actorName, { length: 100 }),
            newName: truncate(data.newName, { length: 100 }),
          })
        );
      } else {
        notifications.info(
          i18next.t('rename-general-notification', {
            oldName: truncate(data.oldName, { length: 100 }),
            newName: truncate(data.newName, { length: 100 }),
            actorName: truncate(actorName, { length: 100 }),
          })
        );
      }
      break;
    }
    case 'muted': {
      const participants = state.participants.entities;
      notifications.warning(
        i18next.t('media-received-force-mute', {
          origin: truncate(participants[data.moderator]?.displayName || 'admin', { length: 50 }),
        })
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

      if (data.moderatorData) {
        dispatch(setModeratorData({ moderatorData: data.moderatorData }));
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
    case 'display_name_change_restrictions_disabled':
      dispatch(enabledSelfRename());
      notifications.info(i18next.t('renaming-enabled-notification'));
      break;
    case 'display_name_change_restrictions_enabled':
      dispatch(disabledSelfRename());
      notifications.info(i18next.t('renaming-disabled-notification'));
      break;
    case 'entry_permission_changed': {
      dispatch(setCanEnter(data.canEnter));
      if (data.canEnter) {
        notifications.info(i18next.t('waiting-room-disabled-message'));
      } else {
        notifications.info(i18next.t('waiting-room-enabled-message'));
      }
      break;
    }
    case 'error': {
      if (data.error === ModerationError.UserCannotBeModerator) {
        notifications.error(i18next.t('moderation-error-user-cannot-be-moderator'));
      }
      break;
    }
    default: {
      const dataString = JSON.stringify(data, null, 2);
      log.error(`Unknown moderation message type: ${dataString}`);
      throw new Error(`Unknown message type: ${dataString}`);
    }
  }
};
