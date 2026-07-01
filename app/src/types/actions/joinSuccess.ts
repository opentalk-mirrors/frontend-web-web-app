// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  BackendFeatures,
  BackendModules,
  EventInfo,
  MeetingDetails,
  SharedFolderData,
  TariffId,
  StreamingTargetId,
  TrainingParticipationReportParameterSet,
  StreamStatusInfo,
  RecordingStatusInfo,
} from '@opentalk/rest-api-rtk-query';

import type {
  ParticipationLogging,
  ParticipationLoggingState,
} from '../../api/types/outgoing/trainingParticipationReport';
import { InitialAutomod } from '../automod';
import { InitialBreakout, RoomKindBreakout, RoomKindMain } from '../breakout';
import { InitialChat } from '../chat';
import type {
  ForceMute,
  ForceMuteType,
  ParticipantId,
  Role,
  Timestamp,
  ParticipationKind,
  ConnectionId,
} from '../common';
import { WaitingRoom } from '../common';
import { DeviceId } from '../device';
import { RoomInfo } from '../event';
import { LegalVoteJoinSuccess, VoteSummary } from '../legalVote';
import { InitialDisplayNameChangeRestrictions } from '../moderation';
import { Participant } from '../participant';
import { InitialPoll } from '../poll';
import { ReactionJoinSuccess } from '../reaction';
import { TimerState } from '../timer';
import { WhiteboardState } from '../whiteboard';

export interface JoinSuccessInternalState {
  participantId: ParticipantId;
  connectionId?: string;
  role: Role;
  avatarUrl?: string;
  automod: InitialAutomod | undefined;
  breakout: InitialBreakout | undefined;
  chat: InitialChat;
  forceMute: ForceMute | undefined;
  moderation: ModerationState | undefined;
  participants: Participant[];
  polls: InitialPoll | undefined;
  raiseHands: RaiseHandsState | undefined;
  reaction: ReactionJoinSuccess | undefined;
  recording: RecordingState | undefined;
  serverTimeOffset: number;
  sharedFolder: SharedFolderData | undefined;
  tariff: SignalingTariff;
  timer: TimerState | undefined;
  votes: VoteSummary[] | undefined;
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
  trainingParticipationReport: ParticipationLogging | undefined;
  enabledModules: EnabledModules;
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
  tariff: SignalingTariff;
  enabledModules: EnabledModules;
  moduleData: ModuleData;
  participants: RoomserverParticipant[];
  eventInfo?: EventInfo;
  meetingDetails: MeetingDetails;
  roomInfo: RoomInfo;
  isRoomOwner: boolean;
}

export type EnabledModules = { [value in BackendModules]?: Array<string> };

export interface ModuleData {
  automod?: InitialAutomod;
  breakout?: InitialBreakout;
  chat: InitialChat;
  excalidraw?: WhiteboardState;
  legalVote?: LegalVoteJoinSuccess;
  livekit: Livekit;
  moderation?: ModerationState;
  polls?: InitialPoll;
  raiseHands?: RaiseHandsState;
  reaction?: ReactionJoinSuccess;
  recording?: RecordingState;
  sharedFolder?: SharedFolderData;
  timer?: TimerState;
  trainingParticipationReport?: TrainingParticipationReport;
  whiteboard?: WhiteboardState;
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
  raiseHands?: RaiseHandsPeerState;
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

export interface RaiseHandsPeerState {
  raisedAt: Timestamp;
}

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

export interface SignalingTariff {
  id: TariffId;
  name: string;
  quotas: Record<string, number>;
  usedQuota: Record<string, number>;
  disabledFeatures: BackendFeatures[];
}

export type ConnectionInfo = { connectionId: ConnectionId; deviceId: DeviceId };

export interface ServiceStreamingTarget {
  location: URL;
}

export interface RecordingServiceState {
  streamingTargets: Record<StreamingTargetId, ServiceStreamingTarget>;
}

export type StreamingTarget = {
  name: string;
  publicUrl: string;
} & StreamStatusInfo;

export interface RecordingState {
  recordingState: RecordingStatusInfo;
  streamStates: Record<StreamingTargetId, StreamingTarget>;
  service?: RecordingServiceState;
}

export interface ModeratorJoinInfo {
  raiseHandsEnabled: boolean;
  guestAccess: boolean;
  waitingRoomParticipants: WaitingRoomParticipant[];
  waitingRoom: WaitingRoom;
}

export interface ModerationState extends ModeratorJoinInfo {
  displayNameChangeRestrictions: InitialDisplayNameChangeRestrictions;
}

export interface RaiseHandsState {
  raiseHandsEnabled: boolean;
  state?: RaiseHandsPeerState;
}
