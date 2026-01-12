// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Middleware, freeze, isAction } from '@reduxjs/toolkit';

import log from '../logger';
import { ConferenceRoom, shutdownConferenceContext } from '../modules/WebRTC';
import { getCurrentConferenceRoom } from '../modules/WebRTC/ConferenceRoom';
import type { AppDispatch, RootState } from '../store';
import { hangUp, startRoom } from '../store/commonActions';
import { initialized as legalVoteInitialized } from '../store/slices/legalVoteSlice';
import { connectionClosed } from '../store/slices/roomSlice';
import { matchBuilder } from '../types';
import {
  handleAutomodMessage,
  handleBreakoutMessage,
  handleChatMessage,
  handleControlMessage,
  handleLegalVoteMessage,
  handleLivekitMessage,
  handleMediaMessage,
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
import { Message as IncomingMessage } from './types/incoming';
import * as outgoing from './types/outgoing';

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
