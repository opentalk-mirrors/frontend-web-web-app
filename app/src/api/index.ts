// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { freeze, isAction, Middleware } from '@reduxjs/toolkit';
import i18next from 'i18next';

import {
  createStackedMessages,
  notificationAction,
  notifications,
  setLibravatarOptions,
  startTimeLimitNotification,
} from '../commonComponents';
import log from '../logger';
import { ConferenceRoom, shutdownConferenceContext } from '../modules/WebRTC';
import { getCurrentConferenceRoom } from '../modules/WebRTC/ConferenceRoom';
import type { AppDispatch, RootState } from '../store';
import { hangUp, joinSuccess, startRoom } from '../store/commonActions';
import {
  handleAutomodMessage,
  handleBreakoutMessage,
  handleChatMessage,
  handleLegalVoteMessage,
  handleLivekitMessage,
  handleMeetingNotesMessage,
  handleMeetingReportMessage,
  handleModerationMessage,
  handlePollVoteMessage,
  handleSharedFolderMessage,
  handleStreamingMessage,
  handleSubroomAudioMessage,
  handleTimerMessage,
  handleTrainingParticipationReportMessage,
  handleWhiteboardMessage,
} from './handlers';
import {
  setChatSettings,
} from '../store/slices/chatSlice';
import { selectLibravatarDefaultImage } from '../store/slices/configSlice';
import {
  initialized as legalVoteInitialized,
} from '../store/slices/legalVoteSlice';
import {
  disableRaisedHands,
  enableRaisedHands,
  forceLowerHand,
  loweredHand,
  raisedHand,
} from '../store/slices/moderationSlice';
import {
  join as participantsJoin,
  leave as participantsLeft,
  patch as participantsPatch,
  selectParticipantsTotal,
  waitingRoomJoined,
  waitingRoomLeft,
} from '../store/slices/participantsSlice';
import {
  connectionClosed,
  enteredWaitingRoom,
  selectParticipantLimit,
} from '../store/slices/roomSlice';
import { selectIsModerator } from '../store/slices/userSlice';
import { setWhiteboardAvailable } from '../store/slices/whiteboardSlice';
import {
  BreakoutRoomId,
  GroupId,
  MeetingNotesAccess,
  matchBuilder,
  Participant,
  ParticipantId,
  ParticipationKind,
  RoomserverParticipant,
  Timestamp,
  WaitingState,
  CorePeerState,
  ChatPeerState,
  Role,
  AutomodSelectionStrategy,
} from '../types';
import {
  core,
  Message as IncomingMessage,
  raiseHands,
} from './types/incoming';
import { RoomserverMessageKey } from './types/incoming/core';
import * as outgoing from './types/outgoing';
import { mapMeetingNotesToMeetingNotesAccess } from './handlers/helpers';
import { startedId } from './handlers/automod';

const mapRoomserverParticipantToUi = (
  state: RootState,
  participant: RoomserverParticipant,
  breakoutRoomId: BreakoutRoomId | null,
  waitingState: WaitingState
): Participant => {
  return {
    id: participant.id,
    connections: participant.connections.map((conn) => conn.connectionId),
    groups: [],
    displayName: participant.moduleData.core.displayName,
    avatarUrl: setLibravatarOptions(participant.moduleData.core.avatarUrl, {
      defaultImage: selectLibravatarDefaultImage(state),
    }),
    handIsUp: false,
    joinedAt: participant.moduleData.core.joinedAt,
    leftAt: participant.moduleData.core.leftAt ?? null,
    handUpdatedAt: undefined,
    breakoutRoomId: breakoutRoomId,
    participationKind: participant.moduleData.core.participationKind,
    lastActive: new Date().toISOString(),
    role: participant.moduleData.core.role,
    waitingState,
    meetingNotesAccess: mapMeetingNotesToMeetingNotesAccess(participant.moduleData.meetingNotes),
    isRoomOwner: participant.moduleData.core.isRoomOwner,
  };
};

const mapJoinedParticipantToUi = (
  state: RootState,
  participant: core.ParticipantConnected,
  breakoutRoomId: BreakoutRoomId | null,
  waitingState: WaitingState
): Participant => ({
  id: participant.participantId,
  connections: [participant.connectionId],
  groups: [],
  displayName: participant.peerData.core.displayName,
  avatarUrl: setLibravatarOptions(participant.peerData.core.avatarUrl, {
    defaultImage: selectLibravatarDefaultImage(state),
  }),
  handIsUp: false,
  joinedAt: participant.peerData.core.joinedAt,
  leftAt: null,
  handUpdatedAt: undefined,
  breakoutRoomId: breakoutRoomId,
  participationKind: participant.peerData.core.participationKind,
  lastActive: new Date().toISOString(),
  role: participant.peerData.core.role,
  waitingState,
  meetingNotesAccess: mapMeetingNotesToMeetingNotesAccess(participant.peerData.meetingNotes),
  isRoomOwner: participant.peerData.core.isRoomOwner,
});

const handleRoomServerCoreMessage = async (
  dispatch: AppDispatch,
  data: core.Message,
  timestamp: Timestamp,
  state: RootState,
  conference: ConferenceRoom
) => {
  switch (data.message) {
    case RoomserverMessageKey.JoinSuccess: {
      const moduleData = data.moduleData;

      const participantsReady = data.participants
        .filter((participant) => participant.moduleData.timer && participant.moduleData.timer.readyStatus === true)
        .map((participant) => participant.id as ParticipantId);

      const groups = moduleData.chat.groupsHistory.map((group) => group.name as GroupId);
      const chatEnabled = moduleData.chat.enabled;
      if (!chatEnabled) {
        dispatch(setChatSettings({ id: data.id, timestamp, enabled: chatEnabled }));
      }

      // const maximumStorage = data.tariff.quotas?.maxStorage;
      // const usedStorage = data.assetStorage?.usedStorage;

      // if (usedStorage) {
      //   if (usedStorage >= maximumStorage) {
      //     showStorageNotification(state, 'error');
      //   } else if (usedStorage >= maximumStorage * 0.95) {
      //     showStorageNotification(state, 'warning');
      //   }
      // }

      const participants = data.participants;

      // TODO
      if (data.connections.length > 0) {
        const coreModuleData: CorePeerState = {
          displayName: data.displayName,
          role: data.role,
          participationKind: ParticipationKind.User,
          joinedAt: new Date().toISOString() as Timestamp,
          isRoomOwner: data.isRoomOwner,
        };

        const chatPeerState: ChatPeerState = {
          ...moduleData.chat,
          groups: groups,
        };

        participants.push({
          id: data.id,
          connections: data.connections,
          moduleData: { ...data.moduleData, core: coreModuleData, chat: chatPeerState },
        });
      }

      let joinedParticipants = participants.map((participant) => {
        return mapRoomserverParticipantToUi(
          state,
          participant,
          moduleData.breakout?.room.id || null,
          WaitingState.Joined
        );
      });

      if (moduleData.moderation?.waitingRoomEnabled && moduleData.moderation.waitingRoomParticipants?.length > 0) {
        const waitingParticipants: Participant[] = moduleData.moderation.waitingRoomParticipants.map(
          (waitingParticipant) => {
            // TODO - still needed?
            // There can be a situation, that some participants are in both arrays (e.g. after Debriefing)
            // Therefore we should give priority to the waiting room, and remove them from the joined participants array
            const duplicateParticipantIndex = joinedParticipants.findIndex(
              (participant: Participant) => participant.id === waitingParticipant.participantId
            );
            if (duplicateParticipantIndex > -1) {
              joinedParticipants.splice(duplicateParticipantIndex, 1);
            }

            return {
              id: waitingParticipant.participantId,
              connections: waitingParticipant.connections,
              groups: [],
              displayName: waitingParticipant.displayName,
              avatarUrl: setLibravatarOptions(waitingParticipant.avatarUrl, {
                defaultImage: selectLibravatarDefaultImage(state),
              }),
              handIsUp: false,
              joinedAt: waitingParticipant.joinedAt,
              leftAt: null,
              handUpdatedAt: undefined,
              breakoutRoomId: null,
              participationKind: ParticipationKind.User,
              lastActive: new Date().toISOString(),
              role: undefined,
              waitingState: WaitingState.Waiting,
              meetingNotesAccess: MeetingNotesAccess.None,
              isRoomOwner: false,
            };
          }
        );

        joinedParticipants = joinedParticipants.concat(waitingParticipants);
      }

      // if (data.breakout !== undefined) {
      //   const breakoutParticipants = data.breakout.participants.map((participant) =>
      //     mapBreakoutToUiParticipant(state, participant, timestamp)
      //   );
      //   // We merge both arrays, removing duplications
      //   // If a participant is already joined, we remove him from breakout array
      //   joinedParticipants = unionBy(joinedParticipants, breakoutParticipants, 'id');
      // }

      // const serverTimeOffset = new Date(timestamp).getTime() - new Date().getTime();
      dispatch(
        joinSuccess({
          participantId: data.id,
          connectionId: data.connectionId,
          avatarUrl: setLibravatarOptions(data.avatarUrl, { defaultImage: selectLibravatarDefaultImage(state) }),
          role: data.role,
          chat: moduleData.chat,
          groups,
          automod: moduleData.automod,
          breakout: moduleData.breakout,
          polls: moduleData.polls,
          votes: moduleData.legalVote?.votes,
          participants: joinedParticipants,
          moderation: moduleData.moderation,
          forceMute: moduleData.livekit?.microphoneRestrictionState,
          recording: moduleData.recording,
          serverTimeOffset: 0,
          tariff: data.tariff,
          timer: moduleData.timer,
          participantsReady,
          sharedFolder: moduleData.sharedFolder,
          eventInfo: data.eventInfo,
          meetingDetails: data.meetingDetails,
          roomInfo: data.roomInfo,
          isRoomOwner: data.isRoomOwner,
          livekit: moduleData.livekit,
          // trainingParticipationReport: data.trainingParticipationReport,
        })
      );

      if (moduleData.automod) {
        if (moduleData.automod.config.selectionStrategy === AutomodSelectionStrategy.Playlist) {
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

      if (moduleData.whiteboard?.status === 'initialized') {
        dispatch(setWhiteboardAvailable({ showWhiteboard: true, url: moduleData.whiteboard.url }));
      }

      if (data.closesAt) {
        await startTimeLimitNotification(data.closesAt);
      }

      // Notify moderator, in case he took the last position of the room and now it's full
      if (data.role === Role.Moderator) {
        const onlineParticipants = joinedParticipants.filter((participant) => {
          const hasNotLeft = participant.leftAt === null;
          const isInRoom = participant.waitingState === WaitingState.Joined;
          const isInTheSameBreakoutRoom = moduleData.breakout?.room.id
            ? participant.breakoutRoomId === moduleData.breakout?.room.id
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
      // const activeTarget =
      //   moduleData.recording &&
      //   Object.values(moduleData.recording.targets).find((target) => target.status === StreamingStatus.Active);
      // if (activeTarget) {
      //   createStreamUpdatedNotification({
      //     kind: activeTarget.streamingKind,
      //     status: activeTarget.status,
      //     publicUrl: activeTarget.streamingKind === StreamingKind.Livestream ? activeTarget.publicUrl : undefined,
      //     eventId: state.room.eventInfo?.id,
      //   });

      //   if (state.streaming.consent === undefined) {
      //     showConsentNotification(dispatch);
      //   }
      // }
      break;
    }
    case RoomserverMessageKey.ParticipantConnected: {
      dispatch(
        participantsJoin({
          participant: mapJoinedParticipantToUi(
            state,
            data,
            conference.roomCredentials.breakoutRoomId,
            WaitingState.Joined
          ),
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
    case RoomserverMessageKey.ParticipantDisconnected: {
      dispatch(
        participantsLeft({
          id: data.participantId,
          connection: data.connectionId,
          timestamp,
          reason: data.reason,
        })
      );
      break;
    }
    case RoomserverMessageKey.InWaitingRoom: {
      dispatch(enteredWaitingRoom());
      break;
    }
    case RoomserverMessageKey.JoinedWaitingRoom:
      dispatch(waitingRoomJoined(data));
      break;
    case RoomserverMessageKey.LeftWaitingRoom: {
      dispatch(waitingRoomLeft(data.id));
      break;
    }
  }
};

const handleRaiseHandsMessage = (
  dispatch: AppDispatch,
  data: raiseHands.Message,
  timestamp: Timestamp,
  state: RootState
) => {
  switch (data.message) {
    case 'raise_hands_disabled':
      notifications.info(i18next.t('turn-handraises-off-notification'));
      dispatch(forceLowerHand());
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
          participantsPatch({
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
          participantsPatch({
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
            participantsPatch({
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

/**
 * Handle incoming websocket messages, sent from the signaling server
 *
 * @param {AppDispatch} dispatch
 * @param conference context of the current conference room
 * @returns (MessageEvent) => void
 * anonymous function that dispatches redux actions based on the Signaling API incoming message
 */
const onMessage =
  (dispatch: AppDispatch, getState: () => RootState, conference: ConferenceRoom) =>
  async (message: IncomingMessage) => {
    switch (message.namespace) {
      case 'core':
        handleRoomServerCoreMessage(dispatch, message.payload, message.timestamp, getState(), conference);
        break;
      case 'e2ee':
        // TODO - #3063 implement e2ee module
        log.error('E2EE module is not implemented yet');
        break;
      case 'breakout':
        handleBreakoutMessage(dispatch, getState(), message.payload, message.timestamp);
        break;
      case 'automod':
        handleAutomodMessage(dispatch, message.payload, getState());
        break;
      case 'legal_vote':
        handleLegalVoteMessage(dispatch, message.payload, getState());
        break;
      case 'moderation':
        handleModerationMessage(dispatch, message.payload, message.timestamp, getState());
        break;
      case 'meeting_notes':
        handleMeetingNotesMessage(dispatch, message.payload, getState());
        break;
      case 'meeting_report':
        handleMeetingReportMessage(message.payload, getState());
        break;
      case 'polls':
        handlePollVoteMessage(dispatch, message.payload);
        break;
      case 'chat':
        handleChatMessage(dispatch, message.payload, message.timestamp, getState());
        break;
      case 'timer':
        handleTimerMessage(dispatch, message.payload);
        break;
      case 'whiteboard':
        handleWhiteboardMessage(dispatch, message.payload, getState());
        break;
      case 'recording':
        await handleStreamingMessage(dispatch, message.payload, getState());
        break;
      case 'shared_folder':
        handleSharedFolderMessage(dispatch, message.payload);
        break;
      case 'livekit':
        handleLivekitMessage(dispatch, message.payload);
        break;
      case 'raise_hands':
        handleRaiseHandsMessage(dispatch, message.payload, message.timestamp, getState());
        break;
      case 'subroom_audio':
        handleSubroomAudioMessage(dispatch, message.payload, getState());
        break;
      case 'training_participation_report':
        handleTrainingParticipationReportMessage(dispatch, message.payload, getState());
        break;
      default: {
        const dataString = JSON.stringify(message, null, 2);
        throw new Error(`Unknown message type: ${dataString}`);
      }
    }
  };

/**
 * Our Signaling API Middleware
 *
 * This middleware creates the SignalingAPI instance and forwards actions meant for the signaling backend to the websocket.
 * It also dispatches redux actions based on incoming signaling packets.
 *
 * @param {MiddlewareAPI<AppDispatch, RootState>>} storeApi The redux store
 * @returns {anonymous function} Middleware Reducer
 */
export const apiMiddleware: Middleware = ({
  dispatch,
  getState,
}: {
  dispatch: AppDispatch;
  getState: () => RootState;
}) => {
  // matchBuilder acts similar to the builder for reducers and allows us to avoid a lot of if statements.
  const actionsMap = matchBuilder<RootState>((builder) => {
    builder
      .addCase(
        startRoom.fulfilled,
        (
          _state,
          {
            payload: { conferenceContext },
            meta: {
              arg: { displayName },
            },
          }
        ) => {
          const connectedHandler = () => conferenceContext.join(displayName);
          const messageHandler = onMessage(dispatch, getState, conferenceContext);

          const shutdownHandler = ({ error }: { error?: number }) => {
            dispatch(connectionClosed({ errorCode: error }));
            conferenceContext.removeEventListener('message', messageHandler);
            conferenceContext.removeEventListener('shutdown', shutdownHandler);
            conferenceContext.removeEventListener('connected', connectedHandler);
          };

          conferenceContext.addEventListener('message', messageHandler);
          conferenceContext.addEventListener('shutdown', shutdownHandler);

          conferenceContext.addEventListener('connected', connectedHandler);
        }
      )
      .addCase(startRoom.pending, () => {
        const conferenceContext = getCurrentConferenceRoom();
        if (conferenceContext !== undefined) {
          log.info('switching room -- webRTC was running, shutting down');
          shutdownConferenceContext();
        }
      })
      .addCase(hangUp.pending, () => {
        dispatch(legalVoteInitialized());
      })
      .addModule((builder) => outgoing.automod.handler(builder, dispatch))
      .addModule((builder) => outgoing.chat.handler(builder, dispatch))
      .addModule((builder) => outgoing.breakout.handler(builder, dispatch))
      .addModule((builder) => outgoing.core.handler(builder, dispatch))
      .addModule((builder) => outgoing.legalVote.handler(builder, dispatch))
      .addModule((builder) => outgoing.livekit.handler(builder, dispatch))
      .addModule((builder) => outgoing.poll.handler(builder, dispatch))
      .addModule((builder) => outgoing.meetingNotes.handler(builder, dispatch))
      .addModule((builder) => outgoing.meetingReport.handler(builder, dispatch))
      .addModule((builder) => outgoing.moderation.handler(builder, dispatch))
      .addModule((builder) => outgoing.subroomAudio.handler(builder, dispatch))
      .addModule((builder) => outgoing.timer.handler(builder, dispatch))
      .addModule((builder) => outgoing.whiteboard.handler(builder, dispatch))
      .addModule((builder) => outgoing.recording.handler(builder, dispatch))
      .addModule((builder) => outgoing.raiseHands.handler(builder, dispatch))
      .addModule((builder) => outgoing.trainingParticipationReport.handler(builder, dispatch));
  });

  return (next) => (action) => {
    if (isAction(action)) {
      const caseHandler = actionsMap[action.type];
      if (caseHandler) {
        caseHandler(freeze(getState(), true), action);
      }
    }
    return next(action);
  };
};
