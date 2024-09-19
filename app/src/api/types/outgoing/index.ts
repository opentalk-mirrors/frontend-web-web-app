// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import * as automod from './automod';
import AutomodMessage from './automod';
import * as breakout from './breakout';
import BreakoutMessage from './breakout';
import * as chat from './chat';
import ChatMessage from './chat';
import * as control from './control';
import ControlMessage from './control';
import * as legalVote from './legalVote';
import LegalVoteMessage from './legalVote';
import * as livekit from './livekit';
import LivekitMessage from './livekit';
import * as media from './media';
import MediaMessage from './media';
import * as meetingNotes from './meetingNotes';
import MeetingNotesMessage from './meetingNotes';
import * as moderation from './moderation';
import ModerationMessage from './moderation';
import * as poll from './poll';
import PollMessage from './poll';
import * as recording from './streaming';
import RecordingMessage from './streaming';
import * as timer from './timer';
import TimerMessage from './timer';
import * as whiteboard from './whiteboard';
import WhiteboardMessage from './whiteboard';

export * as automod from './automod';
export * as legalVote from './legalVote';
export * as breakout from './breakout';
export * as control from './control';
export * as moderation from './moderation';
export * as chat from './chat';
export * as poll from './poll';
export * as media from './media';
export * as meetingNotes from './meetingNotes';
export * as timer from './timer';
export * as whiteboard from './whiteboard';
export * as recording from './streaming';
export * as livekit from './livekit';

export type Action =
  | automod.Action
  | breakout.Action
  | chat.Action
  | control.Action
  | moderation.Action
  | legalVote.Action
  | media.Action
  | poll.Action
  | meetingNotes.Action
  | timer.Action
  | whiteboard.Action
  | recording.Action
  | livekit.Action;

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
  [P in keyof ControlMessage]: ControlMessage[P];
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
  | TimerMessageMappedType
  | WhiteboardMessageMappedType
  | RecordingMessageMappedType
  | LivekitMessageMappedType;
