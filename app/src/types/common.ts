// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Namespaces } from '@opentalk/rest-api-rtk-query';
import { Track } from 'livekit-client';

import { BreakoutRoomId } from './breakout';
import type { MeetingNotesState } from './meetingNotes';
import type { TimerIsReady } from './timer';

export type ParticipantId = string & { readonly __tag: unique symbol };
export type ConnectionId = string & { readonly __tag: unique symbol };
export type ConnectionIdentifier = string & { readonly __tag: unique symbol };
export type TargetId = ParticipantId | BreakoutRoomId;

export type Timestamp = string & { readonly __tag: unique symbol };

export type FetchRequestError = {
  status: number;
  statusText: string;
};

export type FetchRequestState = {
  error?: FetchRequestError;
  loading: boolean;
};

export type MediaSessionType = Track.Source.Camera | Track.Source.ScreenShare;

export enum VideoSetting {
  Off = -1,
  Low = 0,
  Medium = 1,
  High = 2,
}

export enum ParticipationKind {
  Registered = 'registered',
  Guest = 'guest',
  Recorder = 'recorder',
  CallIn = 'call_in',
  RegisteredCallIn = 'registered_call_in',
}

export interface MediaSessionState {
  audio: boolean;
  video: boolean;
  videoSettings: VideoSetting;
}

export interface TrickleCandidate {
  sdpMid: string;
  sdpMLineIndex: number;
  candidate: string;
}

export interface Namespaced<P = void, T extends string = Namespaces> {
  namespace: T;
  payload: P;
}
export interface NamespacedIncoming<P = void, T extends string = Namespaces> extends Namespaced<P, T> {
  timestamp: Timestamp;
}

export interface IParticipantControl {
  displayName: string;
  avatarUrl?: string;
  handIsUp: boolean;
  joinedAt: string;
  leftAt: string | null;
  handUpdatedAt: string;
  participationKind: ParticipationKind;
  role?: Role;
  isRoomOwner: boolean;
}
export enum ForceMuteType {
  Enabled = 'enabled',
  Disabled = 'disabled',
}
export interface ForceMute {
  type: ForceMuteType;
  unrestrictedParticipants: Array<ParticipantId>;
}

export type ParticipantMediaState = {
  screen?: MediaSessionState;
  video?: MediaSessionState;
  forceMute: ForceMute;
};

export interface BackendParticipant {
  id: ParticipantId;
  connectionId?: ParticipantId;
  // Core fields are present in any case
  control: IParticipantControl;
  meetingNotes?: MeetingNotesState;
  media: ParticipantMediaState;
  timer?: TimerIsReady;
}

export interface ErrorStruct<E extends string> {
  message: 'error';
  error: E;
}

export interface Command {
  action: string;
}

export enum Role {
  User = 'user',
  Moderator = 'moderator',
}

export enum WaitingState {
  Joined = 'joined',
  Waiting = 'waiting',
  Approved = 'approved',
}

export type LibravatarDefaultImage = '404' | 'mm' | 'monsterid' | 'wavatar' | 'retro' | 'robohash' | 'pagan';

export enum RoomMode {
  CoffeeBreak = 'coffee-break',
  TalkingStick = 'talking-stick',
}

export enum KickScope {
  All = 'all',
  Guests = 'guests',
  UsersAndGuests = 'users_and_guests',
}

export enum RoomKind {
  Main = 'main',
  Breakout = 'breakout',
}
