// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { EventInfo, SharedFolderData, StreamingState, Tariff } from '@opentalk/rest-api-rtk-query';
import { MeetingDetails, TrainingParticipationReportParameterSet } from '@opentalk/rest-api-rtk-query/src/types/event';

import type {
  ParticipationLogging,
  ParticipationLoggingState,
} from '../../api/types/outgoing/trainingParticipationReport';
import { InitialAutomod } from '../automod';
import { InitialBreakout, RoomKindBreakout, RoomKindMain } from '../breakout';
import { InitialChat } from '../chat';
import type {
  BackendParticipant,
  ForceMute,
  ForceMuteType,
  ParticipantId,
  ParticipantMediaState,
  Role,
  Timestamp,
  ParticipationKind,
  ConnectionId,
} from '../common';
import { DeviceId } from '../device';
import { RoomInfo } from '../event';
import { LegalVoteJoinSuccess, VoteSummary } from '../legalVote';
import { InitialDisplayNameChangeRestrictions } from '../moderation';
import { Participant } from '../participant';
import { InitialPoll } from '../poll';
import { TimerState } from '../timer';
import { WhiteboardState } from '../whiteboard';

export interface JoinSuccessInternalState {
  participantId: ParticipantId;
  connectionId?: string;
  role: Role;
  avatarUrl?: string;
  chat: InitialChat;
  automod?: InitialAutomod;
  breakout?: InitialBreakout;
  polls?: InitialPoll;
  votes?: VoteSummary[];
  participants: Participant[];
  moderation?: {
    raiseHandsEnabled: boolean;
    waitingRoomEnabled: boolean;
    waitingRoomParticipants: WaitingRoomParticipant[];
    displayNameChangeRestrictions: InitialDisplayNameChangeRestrictions;
  };
  forceMute?: ForceMute;
  recording?: StreamingState;
  serverTimeOffset: number;
  tariff: Tariff;
  timer?: TimerState;
  sharedFolder?: SharedFolderData;
  eventInfo?: EventInfo;
  meetingDetails?: MeetingDetails;
  roomInfo?: RoomInfo;
  participantsReady: ParticipantId[];
  isRoomOwner: boolean;
  livekit: {
    room: string;
    token: string;
    publicUrl: string;
  };
  trainingParticipationReport?: ParticipationLogging;
}

export interface JoinSuccessIncoming {
  message: 'join_success';
  id: ParticipantId;
  role: Role;
  avatarUrl?: string;
  assetStorage?: {
    usedStorage: number;
  };
  participants: Array<BackendParticipant>;
  chat: InitialChat;
  automod?: InitialAutomod;
  breakout?: InitialBreakout;
  polls: InitialPoll;
  legalVote: LegalVoteJoinSuccess;
  whiteboard?: WhiteboardState;
  moderation?: {
    raiseHandsEnabled: boolean;
    waitingRoomParticipants: WaitingRoomParticipant[];
    waitingRoomEnabled: boolean;
  };
  media?: ParticipantMediaState;
  recording?: StreamingState;
  timer?: TimerState;
  tariff: Tariff;
  closesAt: Timestamp;
  sharedFolder: SharedFolderData;
  eventInfo?: EventInfo;
  roomInfo?: RoomInfo;
  isRoomOwner: boolean;
  livekit: {
    room: string;
    token: string;
    publicUrl: string;
    microphoneRestrictionState?: ForceMute;
  };
  trainingParticipationReport?: ParticipationLogging;
}

export interface JoinSuccessRoomserver {
  id: ParticipantId;
  connectionId: ConnectionId;
  deviceId: string;
  connections: ConnectionInfo[];
  displayName: string;
  avatarUrl?: string;
  role: Role;
  closesAt?: Timestamp;
  tariff: Tariff;
  moduleData: ModuleData;
  participants: RoomserverParticipant[];
  eventInfo?: EventInfo;
  meetingDetails: MeetingDetails;
  roomInfo: RoomInfo;
  isRoomOwner: boolean;
}

export interface ModuleData {
  chat: InitialChat;
  livekit: Livekit;
  breakout?: InitialBreakout;
  moderation?: {
    raiseHandsEnabled: boolean;
    waitingRoomParticipants: WaitingRoomParticipant[];
    waitingRoomEnabled: boolean;
    displayNameChangeRestrictions: InitialDisplayNameChangeRestrictions;
  };
  recording?: StreamingState;
  timer?: TimerState;
  legalVote?: LegalVoteJoinSuccess;
  whiteboard?: WhiteboardState;
  polls?: InitialPoll;
  automod?: InitialAutomod;
  sharedFolder?: SharedFolderData;
  trainingParticipationReport?: TrainingParticipationReport;
}

export interface TrainingParticipationReport {
  state: ParticipationLoggingState;
  parameter?: TrainingParticipationReportParameterSet;
}

export interface WaitingRoomParticipant {
  participantId: ParticipantId;
  connections: ConnectionId[];
  accepted: boolean;
  joinedAt: Timestamp;
  displayName: string;
  avatarUrl?: string;
}

export interface JoinedWaitingRoomParticipant {
  participantId: ParticipantId;
  connectionIds: ConnectionId[];
  joinedAt: Timestamp;
  displayName: string;
  avatarUrl?: string;
}

export interface PeerModuleData {
  breakout?: BreakoutPeerState;
  core: CorePeerState;
  meetingNotes?: MeetingNotesPeerState;
  timer?: TimerPeerState;
}

export interface CorePeerState {
  /// Display name of the participant
  displayName: string;
  /// Role of the participant
  role: Role;
  /// The URL to the avatar of the participant
  avatarUrl?: string;
  /// The type of participant and how they connected to the meeting.
  participationKind: ParticipationKind;
  /// The timestamp when the participant joined the meeting
  joinedAt: Timestamp;
  /// The timestamp when the participant left the meeting
  leftAt?: Timestamp;
  /// Wether the participant is the room owner
  isRoomOwner: boolean;
}

export interface BreakoutPeerState {
  room: RoomKindMain | RoomKindBreakout;
}

export interface MeetingNotesPeerState {
  readonly: boolean;
}

export interface TimerPeerState {
  readyStatus: boolean;
}

export type JsonValue = number | string | boolean | JsonValue[] | { [key in string]?: JsonValue } | null;

export interface Livekit {
  microphoneRestrictionState: MicrophoneRestrictionState;
  publicUrl: string;
  room: string;
  token: string;
}

export interface MicrophoneRestrictionState {
  type: ForceMuteType;
  unrestrictedParticipants: ParticipantId[];
}

export type RoomserverParticipant = {
  id: ParticipantId;
  connections: ConnectionInfo[];
  moduleData: PeerModuleData;
};

export type ConnectionInfo = { connectionId: ConnectionId; deviceId: DeviceId };
