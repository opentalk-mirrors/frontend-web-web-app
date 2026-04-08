// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import AssetStorage from './assetStorage';
import AutomodMessage from './automod';
import BreakoutMessage from './breakout';
import ChatMessage from './chat';
import RoomserverCoreMessage from './core';
import E2eeMessage from './e2ee';
import RoomServerErrorMessage from './error';
import LegalVoteMessage from './legalVote';
import LivekitMessage from './livekit';
import MediaMessage from './media';
import MeetingNotesMessage from './meetingNotes';
import MeetingReportMessage from './meetingReport';
import ModerationMessage from './moderation';
import PollMessage from './poll';
import RaiseHandsMessage from './raiseHands';
import SharedFolderMessage from './sharedFolder';
import StreamingMessage from './streaming';
import SubroomAudioMessage from './subroomAudio';
import TimerMessage from './timer';
import TrainingParticipationReport from './trainingParticipationReport';
import WhiteboardMessage from './whiteboard';

export * as breakout from './breakout';
export * as chat from './chat';
export * as moderation from './moderation';
export * as poll from './poll';
export * as meetingNotes from './meetingNotes';
export * as meetingReport from './meetingReport';
export * as timer from './timer';
export * as whiteboard from './whiteboard';
export * as media from './media';
export * as streaming from './streaming';
export * as sharedFolder from './sharedFolder';
export * as legalVote from './legalVote';
export * as automod from './automod';
export * as livekit from './livekit';
export * as subroomAudio from './subroomAudio';
export * as trainingParticipationReport from './trainingParticipationReport';
export * as core from './core';
export * as e2ee from './e2ee';
export * as raiseHands from './raiseHands';

export type Message =
  | AutomodMessage
  | BreakoutMessage
  | ChatMessage
  | LegalVoteMessage
  | MediaMessage
  | PollMessage
  | ModerationMessage
  | MeetingNotesMessage
  | MeetingReportMessage
  | TimerMessage
  | WhiteboardMessage
  | StreamingMessage
  | SharedFolderMessage
  | LivekitMessage
  | SubroomAudioMessage
  | TrainingParticipationReport
  | RoomserverCoreMessage
  | RaiseHandsMessage
  | E2eeMessage
  | RoomServerErrorMessage
  | AssetStorage;
