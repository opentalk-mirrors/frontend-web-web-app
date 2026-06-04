// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import * as automod from './automod';
import AutomodMessage from './automod';
import * as breakout from './breakout';
import BreakoutMessage from './breakout';
import * as chat from './chat';
import ChatMessage from './chat';
import * as core from './core';
import CoreMessage from './core';
import * as legalVote from './legalVote';
import LegalVoteMessage from './legalVote';
import * as livekit from './livekit';
import LivekitMessage from './livekit';
import * as media from './media';
import MediaMessage from './media';
import * as meetingNotes from './meetingNotes';
import MeetingNotesMessage from './meetingNotes';
import * as meetingReport from './meetingReport';
import MeetingReportMessage from './meetingReport';
import * as moderation from './moderation';
import ModerationMessage from './moderation';
import * as poll from './poll';
import PollMessage from './poll';
import * as raiseHands from './raiseHands';
import RaiseHandsMessage from './raiseHands';
import * as reaction from './reaction';
import ReactionMessage from './reaction';
import * as recording from './streaming';
import RecordingMessage from './streaming';
import * as subroomAudio from './subroomAudio';
import SubroomAudioMessage from './subroomAudio';
import * as timer from './timer';
import TimerMessage from './timer';
import * as trainingParticipationReport from './trainingParticipationReport';
import TrainingParticipationReportMessage from './trainingParticipationReport';
import * as whiteboard from './whiteboard';
import WhiteboardMessage from './whiteboard';

export * as automod from './automod';
export * as legalVote from './legalVote';
export * as breakout from './breakout';
export * as core from './core';
export * as moderation from './moderation';
export * as chat from './chat';
export * as poll from './poll';
export * as media from './media';
export * as meetingNotes from './meetingNotes';
export * as meetingReport from './meetingReport';
export * as timer from './timer';
export * as whiteboard from './whiteboard';
export * as recording from './streaming';
export * as livekit from './livekit';
export * as raiseHands from './raiseHands';
export * as subroomAudio from './subroomAudio';
export * as trainingParticipationReport from './trainingParticipationReport';
export * as reaction from './reaction';

export type Action =
  | automod.Action
  | breakout.Action
  | chat.Action
  | core.Action
  | moderation.Action
  | legalVote.Action
  | media.Action
  | poll.Action
  | meetingNotes.Action
  | meetingReport.Action
  | timer.Action
  | whiteboard.Action
  | recording.Action
  | livekit.Action
  | raiseHands.Action
  | subroomAudio.Action
  | trainingParticipationReport.Action
  | reaction.Action;

// we need to use type mapping, to convert `Namespaced` interface into types
// otherwise we will have problems with `convertToCamelCase` function
// https://github.com/sindresorhus/camelcase-keys/issues/114#issuecomment-1803661357
type AutomodMessageMappedType = {
  [P in keyof AutomodMessage]: AutomodMessage[P];
};
type BreakoutMessageMappedType = {
  [P in keyof BreakoutMessage]: BreakoutMessage[P];
};
type ChatMessageMappedType = {
  [P in keyof ChatMessage]: ChatMessage[P];
};
type ControlMessageMappedType = {
  [P in keyof CoreMessage]: CoreMessage[P];
};
type ModerationMessageMappedType = {
  [P in keyof ModerationMessage]: ModerationMessage[P];
};
type LegalVoteMessageMappedType = {
  [P in keyof LegalVoteMessage]: LegalVoteMessage[P];
};
type MediaMessageMappedType = {
  [P in keyof MediaMessage]: MediaMessage[P];
};
type PollMessageMappedType = {
  [P in keyof PollMessage]: PollMessage[P];
};
type MeetingNotesMessageMappedType = {
  [P in keyof MeetingNotesMessage]: MeetingNotesMessage[P];
};
type MeetingReportMessageMappedType = {
  [P in keyof MeetingReportMessage]: MeetingReportMessage[P];
};
type TimerMessageMappedType = {
  [P in keyof TimerMessage]: TimerMessage[P];
};
type WhiteboardMessageMappedType = {
  [P in keyof WhiteboardMessage]: WhiteboardMessage[P];
};
type RecordingMessageMappedType = {
  [P in keyof RecordingMessage]: RecordingMessage[P];
};
type LivekitMessageMappedType = {
  [P in keyof LivekitMessage]: LivekitMessage[P];
};
type RaiseHandsMessageMappedType = {
  [P in keyof RaiseHandsMessage]: RaiseHandsMessage[P];
};
type SubroomAudioMessageMappedType = {
  [P in keyof SubroomAudioMessage]: SubroomAudioMessage[P];
};
type TrainingParticipationReportMappedType = {
  [P in keyof TrainingParticipationReportMessage]: TrainingParticipationReportMessage[P];
};

export type Message =
  | AutomodMessageMappedType
  | BreakoutMessageMappedType
  | ChatMessageMappedType
  | ControlMessageMappedType
  | ModerationMessageMappedType
  | LegalVoteMessageMappedType
  | MediaMessageMappedType
  | PollMessageMappedType
  | MeetingNotesMessageMappedType
  | MeetingReportMessageMappedType
  | TimerMessageMappedType
  | WhiteboardMessageMappedType
  | RecordingMessageMappedType
  | LivekitMessageMappedType
  | RaiseHandsMessageMappedType
  | SubroomAudioMessageMappedType
  | TrainingParticipationReportMappedType;
