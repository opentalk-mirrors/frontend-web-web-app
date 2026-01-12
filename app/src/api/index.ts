// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Middleware, freeze, isAction } from '@reduxjs/toolkit';
import i18next from 'i18next';

import { notificationAction } from '../commonComponents';
import { showWithLinkNotification } from '../components/WithLinkNotification';
import log from '../logger';
import { ConferenceRoom, shutdownConferenceContext } from '../modules/WebRTC';
import { getCurrentConferenceRoom } from '../modules/WebRTC/ConferenceRoom';
import type { AppDispatch, RootState } from '../store';
import { hangUp, startRoom } from '../store/commonActions';
import { initialized as legalVoteInitialized } from '../store/slices/legalVoteSlice';
import {
  trainingParticipationReportDisabled,
  trainingParticipationReportEnabled,
} from '../store/slices/moderationSlice';
import { connectionClosed, presenceConfirmationDone, presenceConfirmationRequested } from '../store/slices/roomSlice';
import { matchBuilder } from '../types';
import { composeMeetingDetailsUrl } from '../utils/apiUtils';
import { handleAutomodMessage } from './handlers/automod';
import { handleBreakoutMessage } from './handlers/breakout';
import { handleChatMessage } from './handlers/chat';
import { handleControlMessage } from './handlers/control';
import { handleStorageExceededError, showErrorNotification } from './handlers/helpers';
import { handleLegalVoteMessage } from './handlers/legalVote';
import { handleLivekitMessage } from './handlers/livekit';
import { handleMediaMessage } from './handlers/media';
import { handleMeetingNotesMessage } from './handlers/meetingNotes';
import { handleMeetingReportMessage } from './handlers/meetingReport';
import { handleModerationMessage } from './handlers/moderation';
import { handlePollVoteMessage } from './handlers/poll';
import { handleSharedFolderMessage } from './handlers/sharedFolder';
import { handleStreamingMessage } from './handlers/streaming';
import { handleSubroomAudioMessage } from './handlers/subroomAudio';
import { handleTimerMessage } from './handlers/timer';
import { handleWhiteboardMessage } from './handlers/whiteboard';
import { Message as IncomingMessage, trainingParticipationReport } from './types/incoming';
import * as outgoing from './types/outgoing';

const handleTrainingParticipationReportMessage = (
  dispatch: AppDispatch,
  data: trainingParticipationReport.Message,
  state: RootState
) => {
  switch (data.message) {
    case 'presence_logging_enabled':
      if (state.room.isOwnedByCurrentUser) {
        dispatch(trainingParticipationReportEnabled());
        notificationAction({
          msg: i18next.t('presence-logging-enabled-notification'),
          variant: 'info',
          ariaLive: 'polite',
        });
      }
      break;
    case 'presence_logging_disabled':
      if (state.room.isOwnedByCurrentUser) {
        dispatch(trainingParticipationReportDisabled());
        notificationAction({
          msg: i18next.t('presence-logging-disabled-notification'),
          variant: 'info',
          ariaLive: 'polite',
        });
      }
      break;
    case 'presence_logging_started':
      if (state.room.isOwnedByCurrentUser) {
        notificationAction({
          msg: i18next.t('presence-logging-started-notification'),
          variant: 'info',
          ariaLive: 'polite',
        });
      }
      break;
    case 'presence_logging_ended':
      if (state.room.isOwnedByCurrentUser) {
        notificationAction({
          msg: i18next.t('presence-logging-ended-notification'),
          variant: 'info',
          ariaLive: 'polite',
        });
      } else {
        dispatch(presenceConfirmationDone());
      }
      break;
    case 'presence_confirmation_requested':
      dispatch(presenceConfirmationRequested());
      break;
    case 'presence_confirmation_logged':
      dispatch(presenceConfirmationDone());
      break;
    case 'pdf_asset': {
      if (state.room.isOwnedByCurrentUser) {
        let assetLocation;
        if (state.room.eventInfo?.id) {
          assetLocation = composeMeetingDetailsUrl(state.config.baseUrl, state.room.eventInfo?.id).href;
        }
        showWithLinkNotification({
          translationKey: 'training-participation-report-pdf-asset-notification',
          url: assetLocation,
        });
      }
      break;
    }
    case 'error':
      handleStorageExceededError(state, data.error);
      showErrorNotification(data.error);
      break;
    default: {
      const dataString = JSON.stringify(data, null, 2);
      log.error(`Unknown training participation report message type: ${dataString}`);
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
      case 'control':
        await handleControlMessage(dispatch, getState(), conference, message.payload, message.timestamp);
        break;
      case 'breakout':
        handleBreakoutMessage(dispatch, getState(), message.payload, message.timestamp);
        break;
      case 'media':
        handleMediaMessage(dispatch, message.payload, getState()).catch((e) => {
          log.error('Error in handleMediaMessage:', e);
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
        handleWhiteboardMessage(dispatch, message.payload, getState());
        break;
      case 'recording':
        await handleStreamingMessage(dispatch, message.payload, getState());
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
      .addModule((builder) => outgoing.recording.handler(builder, dispatch))
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
