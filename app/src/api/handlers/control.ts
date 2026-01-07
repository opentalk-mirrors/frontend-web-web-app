// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { StreamingKind, StreamingStatus } from '@opentalk/rest-api-rtk-query';
import i18next from 'i18next';
import { kebabCase, unionBy } from 'lodash';

import {
  createStackedMessages,
  notificationAction,
  notifications,
  setLibravatarOptions,
  showConsentNotification,
  startTimeLimitNotification,
} from '../../commonComponents';
import { createStreamUpdatedNotification } from '../../components/StreamUpdatedNotification';
import i18n from '../../i18n';
import log from '../../logger';
import { ConferenceRoom } from '../../modules/WebRTC';
import type { AppDispatch, RootState } from '../../store';
import { hangUp, joinSuccess } from '../../store/commonActions';
import { setChatSettings } from '../../store/slices/chatSlice';
import { selectLibravatarDefaultImage } from '../../store/slices/configSlice';
import { loweredHand, raisedHand } from '../../store/slices/moderationSlice';
import {
  join as participantsJoin,
  leave as participantsLeft,
  update as participantsUpdate,
  selectParticipantsTotal,
} from '../../store/slices/participantsSlice';
import { joinBlocked, selectParticipantLimit, setIsRoomDeleted } from '../../store/slices/roomSlice';
import { selectIsModerator, updateRole } from '../../store/slices/userSlice';
import { setWhiteboardAvailable } from '../../store/slices/whiteboardSlice';
import { AutomodSelectionStrategy, GroupId, Participant, ParticipantId, Timestamp, WaitingState } from '../../types';
import { control } from '../types/incoming';
import { Role } from '../types/incoming/control';
import { startedId } from './automod';
import {
  mapBreakoutToUiParticipant,
  mapMeetingNotesToMeetingNotesAccess,
  mapToUiParticipant,
  showStorageNotification,
} from './helpers';

/**
 * Handles messages in the control namespace
 * @param {AppDispatch} dispatch  function
 * @param {RootState} state current redux state
 * @param {ConferenceRoom} conference context of the current conference room
 * @param {control.Message} data control message content
 * @param {Timestamp} timestamp of the message
 */
export const handleControlMessage = async (
  dispatch: AppDispatch,
  state: RootState,
  conference: ConferenceRoom, //TODO remove and handle stuff in the webrtc context directly
  data: control.Message,
  timestamp: Timestamp
) => {
  switch (data.message) {
    case 'join_success': {
      const participantsReady = data.participants
        .filter((participant) => participant.timer && participant.timer.readyStatus === true)
        .map((participant) => participant.id as ParticipantId);
      const groups = data.chat.groupsHistory.map((group) => group.name as GroupId);
      data.chat.groups = groups;

      const maximumStorage = data.tariff.quotas?.maxStorage;
      const usedStorage = data.assetStorage?.usedStorage;

      if (usedStorage) {
        if (usedStorage >= maximumStorage) {
          showStorageNotification(state, 'error');
        } else if (usedStorage >= maximumStorage * 0.95) {
          showStorageNotification(state, 'warning');
        }
      }

      const chatEnabled = data.chat.enabled;
      if (!chatEnabled) {
        dispatch(setChatSettings({ id: data.id, timestamp, enabled: chatEnabled }));
      }

      let joinedParticipants: Participant[];
      joinedParticipants = data.participants.map((participant) => {
        return mapToUiParticipant(state, participant, data.breakout?.current || null, WaitingState.Joined);
      });

      if (data.moderation?.waitingRoomEnabled && data.moderation.waitingRoomParticipants.length > 0) {
        // There can be a situation, that some participants are in both arrays (e.g. after Debriefing)
        // Therefore we should give priority to the waiting room, and remove them from the joined participants array
        const waitingParticipants = data.moderation.waitingRoomParticipants.map((waitingParticipant) => {
          const duplicateParticipantIndex = joinedParticipants.findIndex(
            (participant: Participant) => participant.id === waitingParticipant.id
          );
          if (duplicateParticipantIndex > -1) {
            joinedParticipants.splice(duplicateParticipantIndex, 1);
          }
          //TODO the backend should provide a waitingState: 'waiting' | 'approved', change when implemented
          return mapToUiParticipant(state, waitingParticipant, data.breakout?.current || null, WaitingState.Waiting);
        });

        joinedParticipants = joinedParticipants.concat(waitingParticipants);
      }

      if (data.breakout !== undefined) {
        const breakoutParticipants = data.breakout.participants.map((participant) =>
          mapBreakoutToUiParticipant(state, participant, timestamp)
        );
        // We merge both arrays, removing duplications
        // If a participant is already joined, we remove him from breakout array
        joinedParticipants = unionBy(joinedParticipants, breakoutParticipants, 'id');
      }

      const serverTimeOffset = new Date(timestamp).getTime() - Date.now();
      dispatch(
        joinSuccess({
          participantId: data.id,
          avatarUrl: setLibravatarOptions(data.avatarUrl, { defaultImage: selectLibravatarDefaultImage(state) }),
          role: data.role,
          chat: data.chat,
          groups,
          automod: data.automod,
          breakout: data.breakout,
          polls: data.polls,
          votes: data.legalVote?.votes,
          participants: joinedParticipants,
          moderation: data.moderation,
          forceMute: data.livekit?.microphoneRestrictionState,
          recording: data.recording,
          serverTimeOffset,
          tariff: data.tariff,
          timer: data.timer,
          participantsReady: participantsReady,
          sharedFolder: data.sharedFolder,
          eventInfo: data.eventInfo,
          roomInfo: data.roomInfo,
          isRoomOwner: data.isRoomOwner,
          livekit: data.livekit,
          trainingParticipationReport: data.trainingParticipationReport,
        })
      );

      if (data.automod) {
        if (data.automod.config.selectionStrategy === AutomodSelectionStrategy.Playlist) {
          notificationAction({
            key: startedId,
            msg: createStackedMessages([
              i18next.t('talking-stick-started-first-line'),
              i18next.t('talking-stick-started-second-line'),
            ]),
            variant: 'info',
            ariaLive: 'polite',
          });
        }
      }

      if (data.whiteboard?.status === 'initialized') {
        dispatch(setWhiteboardAvailable({ showWhiteboard: true, url: data.whiteboard.url }));
      }

      if (data.closesAt) {
        await startTimeLimitNotification(data.closesAt);
      }

      // Notify moderator, in case he took the last position of the room and now it's full
      if (data.role === Role.Moderator) {
        const onlineParticipants = joinedParticipants.filter((participant) => {
          const hasNotLeft = participant.leftAt === null;
          const isInRoom = participant.waitingState === WaitingState.Joined;
          const isInTheSameBreakoutRoom = data.breakout?.current
            ? participant.breakoutRoomId === data.breakout?.current
            : true;
          return hasNotLeft && isInRoom && isInTheSameBreakoutRoom;
        });
        // Redux store has not been updated yet, therefore we have to add us manually
        const onlineParticipantsNumberPlusMe = onlineParticipants.length + 1;
        const participantLimit = data.tariff.quotas?.roomParticipantLimit;
        if (onlineParticipantsNumberPlusMe >= participantLimit) {
          notifications.error(i18next.t('meeting-notification-participant-limit-reached', { participantLimit }));
        }
      }

      //Show notification for active streaming target
      const activeTarget =
        data.recording &&
        Object.values(data.recording.targets).find((target) => target.status === StreamingStatus.Active);
      if (activeTarget) {
        createStreamUpdatedNotification({
          kind: activeTarget.streamingKind,
          status: activeTarget.status,
          publicUrl: activeTarget.streamingKind === StreamingKind.Livestream ? activeTarget.publicUrl : undefined,
          eventId: state.room.eventInfo?.id,
        });

        if (state.streaming.consent === undefined) {
          await showConsentNotification(dispatch);
        }
      }

      break;
    }
    case 'joined': {
      dispatch(
        participantsJoin({
          participant: mapToUiParticipant(state, data, conference.roomCredentials.breakoutRoomId, WaitingState.Joined),
        })
      );

      // Notify moderator, in case a participant took the last position of the room and now it's full
      if (selectIsModerator(state)) {
        const participantLimit = selectParticipantLimit(state);
        // Redux store has not been updated yet, therefore we have to add new guest manually
        const onlineParticipantsPlusTheNewOne = selectParticipantsTotal(state) + 1;
        if (onlineParticipantsPlusTheNewOne >= participantLimit) {
          notifications.error(i18next.t('meeting-notification-participant-limit-reached', { participantLimit }));
        }
      }
      break;
    }
    case 'join_blocked':
      dispatch(joinBlocked({ reason: data.reason }));
      break;
    case 'left': {
      dispatch(participantsLeft({ id: data.id, timestamp: timestamp, reason: data.reason }));
      break;
    }
    case 'update': {
      if (data.control !== undefined) {
        dispatch(
          participantsUpdate({
            id: data.id,
            lastActive: timestamp,
            waitingState: WaitingState.Joined,
            meetingNotesAccess: mapMeetingNotesToMeetingNotesAccess(data.meetingNotes),
            ...data.control,
          })
        );
      }
      break;
    }
    case 'role_updated':
      dispatch(updateRole(data.newRole));
      if (data.newRole === Role.Moderator) {
        notifications.info(i18next.t('moderation-rights-granted'));
      } else {
        notifications.warning(i18next.t('moderation-rights-revoked'));
      }
      break;
    case 'time_limit_quota_elapsed':
      dispatch(hangUp());
      break;
    case 'hand_raised': {
      dispatch(raisedHand({ timestamp }));
      break;
    }
    case 'hand_lowered': {
      dispatch(loweredHand());
      break;
    }
    case 'room_deleted': {
      dispatch(setIsRoomDeleted(true));
      break;
    }
    case 'moderator_role_granted':
    case 'moderator_role_revoked': {
      const { displayName } = state.participants.entities[data.target] || {};
      notifications[data.message === 'moderator_role_granted' ? 'info' : 'warning'](
        i18n.t(kebabCase(data.message), { displayName })
      );
      break;
    }
    default: {
      const dataString = JSON.stringify(data, null, 2);
      log.error(`Unknown control message type: ${dataString}`);
    }
  }
};
