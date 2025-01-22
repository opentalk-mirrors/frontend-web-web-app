// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { login } from '@opentalk/redux-oidc';
import { Namespaces, StreamingKind, StreamingStatus } from '@opentalk/rest-api-rtk-query';
import { AnyAction, Middleware, freeze } from '@reduxjs/toolkit';
import i18next from 'i18next';
import { kebabCase } from 'lodash';

import {
  createStackedMessages,
  notificationAction,
  notificationPersistent,
  notifications,
  setLibravatarOptions,
  showConsentNotification,
  startTimeLimitNotification,
} from '../commonComponents';
import { createStreamUpdatedNotification } from '../components/StreamUpdatedNotification';
import { showWithLinkNotification } from '../components/WithLinkNotification';
import LayoutOptions from '../enums/LayoutOptions';
import i18n from '../i18n';
import { ConferenceRoom, getCurrentConferenceRoom, shutdownConferenceContext } from '../modules/WebRTC';
import { AppDispatch, RootState } from '../store';
import { hangUp, joinSuccess, startRoom } from '../store/commonActions';
import {
  remainingUpdated as automodRemainingUpdated,
  speakerUpdated as automodSpeakerUpdated,
  started as automodStarted,
  stopped as automodStopped,
  setAsActiveSpeaker,
  setAsInactiveSpeaker,
} from '../store/slices/automodSlice';
import * as breakoutStore from '../store/slices/breakoutSlice';
import { received as chatReceived, clearGlobalChat, setChatSettings } from '../store/slices/chatSlice';
import { selectLibravatarDefaultImage } from '../store/slices/configSlice';
import {
  canceled as legalVoteCanceled,
  initialized as legalVoteInitialized,
  started as legalVoteStarted,
  stopped as legalVoteStopped,
  updated as legalVoteUpdated,
  voted as legalVoteVoted,
} from '../store/slices/legalVoteSlice';
import { getLivekitRoom, setLivekitPopoutStreamAccessToken, setLivekitUnavailable } from '../store/slices/livekitSlice';
import * as mediaStore from '../store/slices/mediaSlice';
import { setMeetingNotesReadUrl, setMeetingNotesWriteUrl } from '../store/slices/meetingNotesSlice';
import {
  disableRaisedHands,
  enableRaisedHands,
  forceLowerHand,
  forceMuteDisabled,
  forceMuteEnabled,
  loweredHand,
  raisedHand,
} from '../store/slices/moderationSlice';
import {
  breakoutJoined,
  breakoutLeft,
  join as participantsJoin,
  leave as participantsLeft,
  rename as participantsRename,
  update as participantsUpdate,
  selectParticipantsTotal,
  waitingRoomJoined,
  waitingRoomLeft,
} from '../store/slices/participantsSlice';
import { selectParticipantById } from '../store/slices/participantsSlice';
import * as pollStore from '../store/slices/pollSlice';
import {
  connectionClosed,
  disableWaitingRoom,
  enableWaitingRoom,
  enteredWaitingRoom,
  joinBlocked,
  readyToEnter,
  selectParticipantLimit,
} from '../store/slices/roomSlice';
import { sharedFolderUpdated } from '../store/slices/sharedFolderSlice';
import { streamUpdated } from '../store/slices/streamingSlice';
import {
  inviteParticipants,
  removeParticipant,
  resetSubroomAudioData,
  selectSubroomAudioState,
  setSubroomAudioData,
  updateParticipantInviteState,
} from '../store/slices/subroomAudioSlice';
import { selectWhisperGroupId } from '../store/slices/subroomAudioSlice';
import { timerStarted, timerStopped, updateParticipantsReady } from '../store/slices/timerSlice';
import { updatedCinemaLayout } from '../store/slices/uiSlice';
import { selectIsModerator, selectOurUuid, setDisplayName, updateRole } from '../store/slices/userSlice';
import { addWhiteboardAsset, setWhiteboardAvailable } from '../store/slices/whiteboardSlice';
import {
  AutomodSelectionStrategy,
  BackendParticipant,
  BreakoutRoomId,
  ChatMessage,
  ChatScope,
  GroupId,
  InitialChatHistory,
  MeetingNotesAccess,
  MeetingNotesState,
  Namespaced,
  Participant,
  ParticipantId,
  ParticipantInOtherRoom,
  Timestamp,
  WaitingState,
  WhisperParticipantState,
  matchBuilder,
} from '../types';
import { composeMeetingDetailsUrl } from '../utils/apiUtils';
import { initSentryReportWithUser } from '../utils/glitchtipUtils';
import { isStringEnum } from '../utils/tsUtils';
import { restApi } from './rest';
import {
  Message as IncomingMessage,
  breakout,
  chat,
  control,
  livekit,
  media,
  meetingNotes,
  meetingReport,
  moderation,
  poll,
  sharedFolder,
  streaming,
  subroomAudio,
  timer,
  whiteboard,
} from './types/incoming';
import { AutomodEventType } from './types/incoming/automod';
import { Role } from './types/incoming/control';
import { LegalVoteError, LegalVoteMessageType, VoteFinalResults } from './types/incoming/legalVote';
import { Action as OutgoingActionType, automod } from './types/outgoing';
import * as outgoing from './types/outgoing';
import { ClearGlobalMessages } from './types/outgoing/chat';
import { acceptWhisperInvite, declineWhisperInvite } from './types/outgoing/subroomAudio';

/**
 * Transforms the dictionary of group chat histories into a list of groupIds and a flat list
 * chat messages with scope 'group'.
 * @param chatHistory
 * @returns {groupIds: Array<GroupId>, messages:Array<ChatMessage>}
 */

const transformChatHistory = (
  chatHistory: InitialChatHistory
): { groupIds: Array<GroupId>; messages: Array<ChatMessage> } => {
  if (Array.isArray(chatHistory) === false) {
    return { groupIds: [], messages: [] };
  }
  const groupIds: GroupId[] = chatHistory.map((e) => e.name);

  const messages = chatHistory.flatMap((e) => {
    return e.history.map(
      (m): ChatMessage => ({
        ...m,
        group: e.name,
        scope: ChatScope.Group,
      })
    );
  });

  return { groupIds, messages };
};

const mapMeetingNotesToMeetingNotesAccess = (meetingNotes?: MeetingNotesState) => {
  if (!meetingNotes) {
    return MeetingNotesAccess.None;
  }
  if (meetingNotes.readonly) {
    return MeetingNotesAccess.Read;
  }
  return MeetingNotesAccess.Write;
};

const mapToUiParticipant = (
  state: RootState,
  { id, control, meetingNotes }: BackendParticipant,
  breakoutRoomId: BreakoutRoomId | null,
  waitingState: WaitingState
): Participant => ({
  id,
  groups: [],
  displayName: control.displayName,
  avatarUrl: setLibravatarOptions(control.avatarUrl, { defaultImage: selectLibravatarDefaultImage(state) }),
  handIsUp: control.handIsUp,
  joinedAt: control.joinedAt,
  leftAt: control.leftAt,
  handUpdatedAt: control.handUpdatedAt,
  breakoutRoomId: breakoutRoomId,
  participationKind: control.participationKind,
  lastActive: control.joinedAt,
  role: control.role,
  waitingState,
  meetingNotesAccess: mapMeetingNotesToMeetingNotesAccess(meetingNotes),
  isRoomOwner: control.isRoomOwner,
});

const mapBreakoutToUiParticipant = (
  state: RootState,
  { breakoutRoom, id, displayName, avatarUrl, participationKind, leftAt }: ParticipantInOtherRoom,
  joinTime: string
): Participant => ({
  id,
  groups: [],
  displayName,
  avatarUrl: setLibravatarOptions(avatarUrl, { defaultImage: selectLibravatarDefaultImage(state) }),
  handIsUp: false,
  joinedAt: joinTime,
  leftAt: leftAt,
  handUpdatedAt: undefined,
  breakoutRoomId: breakoutRoom,
  participationKind,
  lastActive: joinTime,
  waitingState: WaitingState.Joined,
  meetingNotesAccess: MeetingNotesAccess.None,
  isRoomOwner: false,
});

export const sendMessage = (message: Namespaced<OutgoingActionType | ClearGlobalMessages, Namespaces>) => {
  const conferenceContext = getCurrentConferenceRoom();
  if (conferenceContext === undefined) {
    throw new Error('can not send message to conferenceContext');
  }
  conferenceContext.sendMessage(message as outgoing.Message /*TODO remove conversion*/);
};

//TODO: improve to a more general solution with proper typing as part of #2251(https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2251)
const showErrorNotification = (message: string) => {
  const errorMessage = message.replaceAll('_', '-');

  const isLegalVoteError = isStringEnum(LegalVoteError)(message);
  if (isLegalVoteError) {
    notifications.error(i18next.t(`${errorMessage}-error`));
    return;
  }

  notifications.error(i18next.t('internal-error'));
};

/**
 * Started talking stick notification ID, reused accross different
 * event handlers.
 */
const startedId = 'handleAutomodMessage-started-id';

/**
 * Handles messages in the control namespace
 * @param {AppDispatch} dispatch  function
 * @param {ConferenceRoom} conference context of the current conference room
 * @param {control.Message} data control message content
 * @param {Timestamp} timestamp of the message
 */
const handleControlMessage = async (
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
      const { groupIds, messages: groupMessages } = transformChatHistory(data.chat.groupsHistory);
      const groups = groupIds;
      let roomHistory = data.chat.roomHistory as ChatMessage[];
      roomHistory = roomHistory.concat(groupMessages);

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
        joinedParticipants = data.breakout.participants
          .map((participant) => mapBreakoutToUiParticipant(state, participant, timestamp))
          .concat(joinedParticipants);
      }

      const serverTimeOffset = new Date(timestamp).getTime() - new Date().getTime();
      dispatch(
        joinSuccess({
          participantId: data.id,
          avatarUrl: setLibravatarOptions(data.avatarUrl, { defaultImage: selectLibravatarDefaultImage(state) }),
          role: data.role,
          chat: {
            enabled: data.chat.enabled,
            roomHistory,
            lastSeenTimestampGlobal: data.chat.lastSeenTimestampGlobal,
            lastSeenTimestampsGroup: data.chat.lastSeenTimestampsGroup,
            lastSeenTimestampsPrivate: data.chat.lastSeenTimestampsPrivate,
          },
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
        startTimeLimitNotification(data.closesAt);
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
          showConsentNotification(dispatch);
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
      const whisperId = selectWhisperGroupId(state);
      getLivekitRoom().remoteParticipants.delete(data.id);
      dispatch(participantsLeft({ id: data.id, timestamp: timestamp }));
      if (whisperId) {
        dispatch(removeParticipant({ whisperId, participantId: data.id }));
      }
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
      console.error(`Unknown control message type: ${dataString}`);
    }
  }
};

/**
 * Handles messages in the media namespace
 * @param dispatch AppDispatch function
 * @param data mediaMsgs Message content
 */
const handleMediaMessage = async (dispatch: AppDispatch, data: media.Message, state: RootState) => {
  switch (data.message) {
    case 'presenter_role_granted':
    case 'presenter_role_revoked': {
      const [participantId] = data.participantIds;
      const { displayName } = state.participants.entities[participantId] || {};
      notifications[data.message === 'presenter_role_granted' ? 'info' : 'warning'](
        i18n.t(kebabCase(data.message), { displayName })
      );
      break;
    }
    case 'error': {
      const error = data.error;
      switch (error) {
        case 'invalid_end_of_candidates':
          notificationPersistent({
            msg: i18next.t('media-ice-connection-not-possible'),
            variant: 'error',
            ariaLive: 'assertive',
          });
          break;
        case 'invalid_request_offer':
        case 'invalid_sdp_offer':
        case 'handle_sdp_answer':
        case 'invalid_candidate':
        case 'invalid_configure_request':
        case 'permission_denied':
          console.error(`Media Error: ${data}`);
          notifications.error(i18next.t('error-general'));
          throw new Error(`Media Error: ${error}`);
        default:
          console.error(`Media Error: ${data}`);
          throw new Error(`Media Error: ${error}`);
      }
    }
  }
};

/**
 * Handles messages in the breakout namespace
 * @param {AppDispatch} dispatch function send an event
 * @param {breakout.Message} data message content
 * @param {Timestamp} timestamp from backend of the current message
 */
const handleBreakoutMessage = (
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
        dispatch(
          breakoutJoined({
            data: modifiedData,
            timestamp,
          })
        );
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
      console.error(`Unknown breakout message type: ${dataString}`);
      throw new Error(`Unknown message type: ${dataString}`);
    }
  }
};

/**
 * Handles messages in the automod namespace
 * @param dispatch AppDispatch function
 * @param data mediaMsgs Message content
 */
const handleAutomodMessage = (dispatch: AppDispatch, data: AutomodEventType, state: RootState) => {
  const stoppedId = 'handleAutomodMessage-stopped-id';
  const nextId = 'handleAutomodMessage-next-id';
  const currentId = 'handleAutomodMessage-current-id';
  const unmutedId = 'handleAutomodMessage-unmute-only-id';
  const MIN_RECOMMENDED_TALKING_STICK_PARTICIPANTS = 3;

  switch (data.message) {
    case 'started': {
      notifications.close(stoppedId);
      notifications.close(nextId);
      notifications.close(currentId);
      notifications.close(unmutedId);
      dispatch(automodStarted(data));

      const totalParticipants = selectParticipantsTotal(state);
      if (totalParticipants < MIN_RECOMMENDED_TALKING_STICK_PARTICIPANTS) {
        notifications.warning(i18next.t('talking-stick-participant-amount-notification'));
      }

      if (data.selectionStrategy === AutomodSelectionStrategy.Playlist) {
        notificationAction({
          key: startedId,
          msg: createStackedMessages([
            i18next.t('talking-stick-started-first-line'),
            i18next.t('talking-stick-started-second-line'),
          ]),
          variant: 'info',
          ariaLive: 'polite',
        });

        if (data.issuedBy === state.user.uuid) {
          dispatch(automod.selectNext.action());
        }
      }

      getLivekitRoom().localParticipant.setMicrophoneEnabled(false);
      break;
    }
    case 'stopped': {
      notifications.close(startedId);
      notifications.close(nextId);
      notifications.close(currentId);
      notifications.close(unmutedId);
      dispatch(automodStopped());
      notificationAction({
        key: stoppedId,
        msg: i18next.t('talking-stick-finished'),
        variant: 'info',
        ariaLive: 'polite',
      });

      getLivekitRoom().localParticipant.setMicrophoneEnabled(false);
      break;
    }
    // case 'start_animation':
    //   dispatch(slotStore.initLottery({ winner: data.result, pool: data.pool }));
    //   break;
    case 'remaining_updated':
      dispatch(automodRemainingUpdated(data));
      break;
    case 'speaker_updated': {
      const room = getLivekitRoom();
      if (data.speaker !== state.user.uuid) {
        room.localParticipant.setMicrophoneEnabled(false);
        dispatch(setAsInactiveSpeaker());
      }
      notifications.close(nextId);
      notifications.close(currentId);
      notifications.close(unmutedId);
      if (data.remaining?.[0] && data.remaining[0] === state.user.uuid) {
        notificationAction({
          key: nextId,
          msg: i18next.t('talking-stick-next-announcement'),
          variant: 'warning',
          ariaLive: 'polite',
          persist: true,
        });
      }
      if (data.speaker === state.user.uuid && state.automod.speakerState === 'inactive') {
        dispatch(setAsActiveSpeaker());

        const unmutedNotificationOptions = {
          onNext: () => {
            dispatch(automod.pass.action());
            notifications.close(unmutedId);
          },
          isLastSpeaker: Boolean(data.remaining && data.remaining.length === 0),
          key: unmutedId,
        } as const;

        if (room.localParticipant.isMicrophoneEnabled) {
          notifications.showTalkingStickUnmutedNotification(unmutedNotificationOptions);
        } else {
          notifications.showTalkingStickMutedNotification({
            onUnmute: async () => {
              notifications.close(currentId);
              room.localParticipant.setMicrophoneEnabled(true);
              notifications.showTalkingStickUnmutedNotification(unmutedNotificationOptions);
            },
            onNext: () => {
              dispatch(automod.pass.action());
              notifications.close(currentId);
            },
            key: currentId,
          });
        }
      }
      dispatch(automodSpeakerUpdated(data));
      break;
    }
    case 'error':
      showErrorNotification(data.error);
      break;
    default: {
      const dataString = JSON.stringify(data, null, 2);
      console.error(`Unknown automod message type: ${dataString}`);
      throw new Error(`Unknown message type: ${dataString}`);
    }
  }
};

/**
 * Handles messages in the legal-vote namespace
 * @param dispatch AppDispatch function
 * @param data mediaMsgs Message content
 */
const handleLegalVoteMessage = (dispatch: AppDispatch, data: LegalVoteMessageType, state: RootState) => {
  switch (data.message) {
    case 'pdf_asset':
      //TODO implement pdf asset handling
      break;
    case 'started':
      dispatch(legalVoteStarted(data));
      break;
    case 'stopped':
      dispatch(legalVoteStopped(data));
      notifications.info(i18next.t('legal-vote-stopped'));
      if (data.results === VoteFinalResults.Invalid) {
        notifications.warning(i18next.t('legal-vote-stopped-invalid-results-notification'));
      }
      break;
    case 'updated':
      dispatch(legalVoteUpdated(data));
      break;
    case 'canceled':
      dispatch(legalVoteCanceled(data));
      notifications.error(i18next.t('legal-vote-canceled'));
      break;
    case 'voted':
      if (data.response === 'success') {
        dispatch(legalVoteVoted(data));
      } else {
        notifications.error(i18next.t('legal-vote-error'));
      }
      break;
    case 'reported_issue': {
      // report came from others and not us, our id is not part of participants but user slice.
      if (data.participantId !== state.user.uuid) {
        const displayName = state.participants.entities[data.participantId]?.displayName || i18n.t('global-someone');
        if (data.kind) {
          notifications.warning(
            i18n.t('legal-vote-report-issue-kind-notification', {
              displayName: displayName,
              kind: data.kind,
            })
          );
        } else {
          notifications.warning(
            i18n.t('legal-vote-report-issue-description-notification', {
              displayName: displayName,
              description: data.description,
            })
          );
        }
      }
      break;
    }
    case 'error':
      showErrorNotification(data.error);
      break;
    default: {
      const dataString = JSON.stringify(data, null, 2);
      console.error(`Unknown legal vote message type: ${dataString}`);
      throw new Error(`Unknown message type: ${dataString}`);
    }
  }
};

/**
 * Handles messages in the poll namespace
 * @param {AppDispatch} dispatch function to fire an event
 * @param {poll.Message} data message content
 */
const handlePollVoteMessage = (dispatch: AppDispatch, data: poll.Message) => {
  switch (data.message) {
    case 'started':
      dispatch(pollStore.started(data));
      break;
    case 'live_update':
      dispatch(pollStore.liveUpdated(data));
      break;
    case 'done':
      dispatch(pollStore.done(data));
      break;
    case 'error':
      // todo error handling in BE seems to be wrong
      console.error('Poll error message', data);
      // dispatchError(data.error.replace('_', '-'));
      break;
    default: {
      const dataString = JSON.stringify(data, null, 2);
      console.error(`Unknown poll message type: ${dataString}`);
      throw new Error(`Unknown message type: ${dataString}`);
    }
  }
};

/**
 * Handles messages in the moderation namespace
 * @param {AppDispatch} dispatch function to fire an event
 * @param {moderation.Message} data Message content
 */
const handleModerationMessage = (dispatch: AppDispatch, data: moderation.Message, state: RootState) => {
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
      const room = getLivekitRoom();
      room.localParticipant.setScreenShareEnabled(false);
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
      notifications.info(
        i18next.t(
          state.user.role === Role.Moderator
            ? 'debriefing-session-ended-for-all-notification'
            : 'debriefing-session-ended-notification'
        )
      );
      dispatch(hangUp());
      break;
    case 'display_name_changed':
      dispatch(
        participantsRename({
          id: data.target,
          displayName: data.newName,
        })
      );
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
      console.error(`Unknown moderation message type: ${dataString}`);
      throw new Error(`Unknown message type: ${dataString}`);
    }
  }
};

/**
 * Handles meetingNotes messages
 *
 * It takes a dispatch function and a meetingNotes message, and dispatches an action based on the message
 * @param {AppDispatch} dispatch - this is the dispatch function from the redux store.
 * @param data - meetingNotes.IncomingMeetingNotes
 */
const handleMeetingNotesMessage = (
  dispatch: AppDispatch,
  data: meetingNotes.IncomingMeetingNotes,
  state: RootState
) => {
  switch (data.message) {
    case 'pdf_asset':
      notifications.info(i18next.t('meeting-notes-upload-pdf-message'));
      break;
    case 'write_url':
      if (state.user.meetingNotesAccess === MeetingNotesAccess.None) {
        const message = i18next.t(
          state.user.role === Role.Moderator
            ? 'meeting-notes-created-all-notification'
            : 'meeting-notes-created-notification'
        );
        notificationAction({
          msg: message,
          variant: 'info',
          ariaLive: 'polite',
          actionBtnText: i18next.t('meeting-notes-new-meeting-notes-message-button'),
          onAction: () => dispatch(updatedCinemaLayout(LayoutOptions.MeetingNotes)),
        });
      }
      dispatch(setMeetingNotesWriteUrl(data.url.toString()));
      break;
    case 'read_url':
      if (state.user.meetingNotesAccess === MeetingNotesAccess.None) {
        const message = i18next.t(
          state.user.role === Role.Moderator
            ? 'meeting-notes-created-all-notification'
            : 'meeting-notes-created-notification'
        );
        notificationAction({
          msg: message,
          variant: 'info',
          ariaLive: 'polite',
          actionBtnText: i18next.t('meeting-notes-new-meeting-notes-message-button'),
          onAction: () => dispatch(updatedCinemaLayout(LayoutOptions.MeetingNotes)),
        });
      }
      dispatch(setMeetingNotesReadUrl(data.url.toString()));
      break;
    case 'error':
      showErrorNotification(data.error);
      break;
    default: {
      const dataString = JSON.stringify(data, null, 2);
      console.error(`Unknown meeting notes message type: ${dataString}`);
      throw new Error(`Unknown message type: ${dataString}`);
    }
  }
};

/**
 * Handles meetingReport messages
 *
 * It takes a dispatch function and a meetingReport message, and dispatches an action based on the message
 * @param {AppDispatch} dispatch function to fire an event
 * @param {meetingReport.Message} data Message content
 * @param {RootState} state Global state
 */
const handleMeetingReportMessage = (dispatch: AppDispatch, data: meetingReport.Message, state: RootState) => {
  let assetLocation;
  switch (data.message) {
    case 'pdf_asset':
      if (state.room.eventInfo?.id) {
        assetLocation = composeMeetingDetailsUrl(state.config.baseUrl, state.room.eventInfo?.id).href;
      }
      showWithLinkNotification({ translationKey: 'meeting-report-pdf-asset-message', url: assetLocation });
      break;
    case 'error':
      // Will be handled in https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2165
      break;
    default: {
      const dataString = JSON.stringify(data, null, 2);
      console.error(`Unknown meeting report message type: ${dataString}`);
      throw new Error(`Unknown message type: ${dataString}`);
    }
  }
};

/**
 * Handles timer messages
 *
 * It takes a dispatch function and a protocol message, and dispatches an action based on the message
 * @param {AppDispatch} dispatch - this is the dispatch function from the redux store.
 * @param {timer.Message} data Message content
 */
const handleTimerMessage = (dispatch: AppDispatch, data: timer.Message) => {
  switch (data.message) {
    case 'started':
      dispatch(timerStarted(data));
      break;
    case 'stopped':
      dispatch(timerStopped(data));
      break;
    case 'updated_ready_status':
      dispatch(updateParticipantsReady(data));
      break;
    default: {
      const dataString = JSON.stringify(data, null, 2);
      console.error(`Unknown timer message type: ${dataString}`);
      throw new Error(`Unknown message type: ${dataString}`);
    }
  }
};

/**
 * Handles timer messages
 *
 * It takes a dispatch function and a protocol message, and dispatches an action based on the message
 * @param {AppDispatch} dispatch - this is the dispatch function from the redux store.
 * @param {timer.Message} data Message content
 */
const handleWhiteboardMessage = (dispatch: AppDispatch, data: whiteboard.Message) => {
  switch (data.message) {
    case 'space_url':
      dispatch(setWhiteboardAvailable({ showWhiteboard: true, url: data.url }));
      break;
    case 'pdf_asset':
      dispatch(addWhiteboardAsset({ asset: { assetId: data.assetId, filename: data.filename } }));
      notificationAction({
        msg: i18next.t('whiteboard-new-pdf-message'),
        variant: 'info',
        ariaLive: 'polite',
      });

      break;
    default: {
      const dataString = JSON.stringify(data, null, 2);
      console.error(`Unknown timer message type: ${dataString}`);
      throw new Error(`Unknown message type: ${dataString}`);
    }
  }
};

const handleChatMessage = (dispatch: AppDispatch, data: chat.ChatMessage, timestamp: Timestamp, state: RootState) => {
  switch (data.message) {
    case 'chat_enabled':
    case 'chat_disabled': {
      const enabled = data.message === 'chat_enabled';
      notifications.info(i18next.t(`chat-${enabled ? 'enabled' : 'disabled'}-message`));
      dispatch(setChatSettings({ id: data.id, timestamp, enabled }));
      break;
    }
    case 'message_sent': {
      const chatMessage = data;
      if (chatMessage.scope === ChatScope.Private && chatMessage.target === state.user.uuid) {
        data.target = data.source;
        notifications.info(i18next.t('chat-new-private-message'));
      }
      if (chatMessage.scope === ChatScope.Group && data.source !== state.user.uuid) {
        notifications.info(i18next.t('chat-new-group-message'));
      }
      dispatch(chatReceived({ timestamp, ...data }));
      break;
    }
    case 'history_cleared':
      dispatch(clearGlobalChat());
      notifications.info(i18next.t('chat-delete-global-messages-success'));
      break;
    default: {
      const dataString = JSON.stringify(data, null, 2);
      console.error(`Unknown chat message type: ${dataString}`);
      throw new Error(`Unknown message type: ${dataString}`);
    }
  }
};

const handleStreamingMessage = (dispatch: AppDispatch, data: streaming.Message, state: RootState) => {
  switch (data.message) {
    case 'stream_updated': {
      dispatch(streamUpdated(data));

      const streamTarget = state.streaming.streams.entities[data.targetId];
      if (streamTarget) {
        const publicUrl =
          streamTarget.streamingKind === StreamingKind.Livestream && streamTarget.publicUrl
            ? streamTarget.publicUrl
            : undefined;
        //Add notification handler based on status
        createStreamUpdatedNotification({
          kind: streamTarget.streamingKind,
          status: data.status,
          publicUrl,
          eventId: state.room.eventInfo?.id,
        });
      }
      if (data.status === StreamingStatus.Active && state.streaming.consent === undefined) {
        showConsentNotification(dispatch);
      }
      break;
    }
    case 'recorder_error': {
      if (data.error === 'timeout') {
        notifications.error(i18next.t('livestream-start-error', { error: data.error }));
      }
      break;
    }
    default: {
      const dataString = JSON.stringify(data, null, 2);
      console.error(`Unknown recording message type: ${dataString}`);
      throw new Error(`Unknown message type: ${dataString}`);
    }
  }
};

const handleSharedFolderMessage = (dispatch: AppDispatch, data: sharedFolder.Message) => {
  switch (data.message) {
    case 'updated':
      dispatch(sharedFolderUpdated({ read: data.read, readWrite: data.readWrite }));
      break;
    default: {
      const dataString = JSON.stringify(data, null, 2);
      console.error(`Unknown shared_folder message type: ${dataString}`);
      throw new Error(`Unknown message type: ${dataString}`);
    }
  }
};

const handleLivekitMessage = (dispatch: AppDispatch, data: livekit.Message, state: RootState) => {
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
    case 'force_muted': {
      const participants = state.participants.entities;
      notifications.warning(
        i18next.t('media-received-force-mute', { origin: participants[data.moderator]?.displayName || 'admin' })
      );
      dispatch(mediaStore.notificationShown());
      return;
    }
    case 'popout_stream_access_token': {
      dispatch(setLivekitPopoutStreamAccessToken(data.token));
      return;
    }
    case 'error': {
      const error = data.error;
      switch (error) {
        case 'livekit_unavailable':
          dispatch(setLivekitUnavailable(true));
          break;
        default:
          console.error(`Livekit Error: ${data}`);
          throw new Error(`Livekit Error: ${error}`);
      }
      break;
    }
    default: {
      const dataString = JSON.stringify(data, null, 2);
      console.error(`Unknown livekit message type: ${dataString}`);
      throw new Error(`Unknown message type: ${dataString}`);
    }
  }
};

const handleSubroomAudioMessage = (dispatch: AppDispatch, data: subroomAudio.Message, state: RootState) => {
  switch (data.message) {
    case 'whisper_group_created':
      dispatch(
        setSubroomAudioData({
          whisperId: data.whisperId,
          token: data.token,
          participants: data.participants,
        })
      );
      break;
    case 'whisper_invite': {
      const isAlreadyInWhisperGroup = selectSubroomAudioState(state).whisperId;
      if (isAlreadyInWhisperGroup) {
        dispatch(declineWhisperInvite.action({ whisperId: data.whisperId }));
        break;
      }
      dispatch(setSubroomAudioData({ whisperId: data.whisperId, participants: data.participants }));

      const displayName = selectParticipantById(data.issuer)(state)?.displayName;
      notificationAction({
        msg: i18next.t('whisper-invite-notification', { displayName }),
        variant: 'info',
        ariaLive: 'polite',
        actionBtnText: i18next.t('global-accept'),
        cancelBtnText: i18next.t('global-decline'),
        persist: true,
        onAction: () => {
          dispatch(acceptWhisperInvite.action({ whisperId: data.whisperId }));
        },
        onCancel: () => {
          dispatch(declineWhisperInvite.action({ whisperId: data.whisperId }));
          dispatch(resetSubroomAudioData());
        },
      });
      break;
    }
    case 'whisper_token': {
      const subroomAudioState = selectSubroomAudioState(state);
      const myOwnParticipantId = selectOurUuid(state);
      const updatedParticipants = subroomAudioState.participants.map((p) =>
        p.participantId === myOwnParticipantId ? { ...p, state: WhisperParticipantState.Accepted } : p
      );
      dispatch(
        setSubroomAudioData({ whisperId: data.whisperId, token: data.token, participants: updatedParticipants })
      );
      break;
    }
    case 'participants_invited':
      dispatch(inviteParticipants({ participants: data.participantIds }));
      break;
    case 'whisper_invite_accepted': {
      const displayName = selectParticipantById(data.participantId)(state)?.displayName;
      notificationAction({
        msg: i18next.t('whisper-invite-accept-notification', { displayName }),
        variant: 'info',
        ariaLive: 'polite',
      });
      dispatch(
        updateParticipantInviteState({
          participantId: data.participantId,
          participantState: WhisperParticipantState.Accepted,
        })
      );
      break;
    }
    case 'whisper_invite_declined': {
      const displayName = selectParticipantById(data.participantId)(state)?.displayName;
      dispatch(removeParticipant({ participantId: data.participantId }));
      notificationAction({
        msg: `${displayName} declined your invitation`,
        variant: 'error',
        ariaLive: 'assertive',
      });
      break;
    }
    case 'left_whisper_group':
      dispatch(removeParticipant({ participantId: data.participantId }));
      break;
    case 'whisper_group_disbanded':
      dispatch(resetSubroomAudioData());
      break;
    case 'error': {
      const error = data.error;
      switch (error) {
        default:
          console.error(`Livekit Error: ${data}`);
          throw new Error(`Livekit Error: ${error}`);
      }
    }
    default: {
      const dataString = JSON.stringify(data, null, 2);
      console.error(`Unknown subroom audio message type: ${dataString}`);
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
  (dispatch: AppDispatch, getState: () => RootState, conference: ConferenceRoom) => (message: IncomingMessage) => {
    switch (message.namespace) {
      case 'control':
        handleControlMessage(dispatch, getState(), conference, message.payload, message.timestamp);
        break;
      case 'breakout':
        handleBreakoutMessage(dispatch, getState(), message.payload, message.timestamp);
        break;
      case 'media':
        handleMediaMessage(dispatch, message.payload, getState()).catch((e) => {
          console.error('Error in handleMediaMessage:', e);
        });
        break;
      case 'automod':
        handleAutomodMessage(dispatch, message.payload, getState());
        break;
      case 'legal_vote':
        handleLegalVoteMessage(dispatch, message.payload, getState());
        break;
      case 'moderation':
        handleModerationMessage(dispatch, message.payload, getState());
        break;
      case 'meeting_notes':
        handleMeetingNotesMessage(dispatch, message.payload, getState());
        break;
      case 'meeting_report':
        handleMeetingReportMessage(dispatch, message.payload, getState());
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
        handleWhiteboardMessage(dispatch, message.payload);
        break;
      case 'recording':
        handleStreamingMessage(dispatch, message.payload, getState());
        break;
      case 'shared_folder':
        handleSharedFolderMessage(dispatch, message.payload);
        break;
      case 'livekit':
        handleLivekitMessage(dispatch, message.payload, getState());
        break;
      case 'subroom_audio':
        handleSubroomAudioMessage(dispatch, message.payload, getState());
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
      .addCase(login.fulfilled, () => {
        dispatch(restApi.endpoints.getMe.initiate()).then((user) => {
          user.data &&
            i18n.language !== user.data?.language &&
            user.data?.language.length > 0 &&
            i18n.changeLanguage(user.data?.language);
          if (user.data) {
            initSentryReportWithUser({ name: user.data.displayName, email: user.data.email, lang: user.data.language });
          }
        });
      })
      .addCase(
        startRoom.fulfilled,
        (
          state,
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
          console.info('switching room -- webRTC was running, shutting down');
          shutdownConferenceContext();
        }
      })
      .addCase(hangUp.pending, () => {
        dispatch(legalVoteInitialized());
      })
      .addModule((builder) => outgoing.automod.handler(builder, dispatch))
      .addModule((builder) => outgoing.chat.handler(builder, dispatch))
      .addModule((builder) => outgoing.breakout.handler(builder, dispatch))
      .addModule((builder) => outgoing.control.handler(builder, dispatch))
      .addModule((builder) => outgoing.legalVote.handler(builder, dispatch))
      .addModule((builder) => outgoing.livekit.handler(builder, dispatch))
      .addModule((builder) => outgoing.poll.handler(builder, dispatch))
      .addModule((builder) => outgoing.meetingNotes.handler(builder, dispatch))
      .addModule((builder) => outgoing.meetingReport.handler(builder, dispatch))
      .addModule((builder) => outgoing.moderation.handler(builder, dispatch))
      .addModule((builder) => outgoing.subroomAudio.handler(builder, dispatch))
      .addModule((builder) => outgoing.timer.handler(builder, dispatch))
      .addModule((builder) => outgoing.whiteboard.handler(builder, dispatch))
      .addModule((builder) => outgoing.recording.handler(builder, dispatch));
  });

  return (next) => (action: AnyAction) => {
    const caseHandler = actionsMap[action.type];
    if (caseHandler) {
      caseHandler(freeze(getState(), true), action);
    }
    return next(action);
  };
};
