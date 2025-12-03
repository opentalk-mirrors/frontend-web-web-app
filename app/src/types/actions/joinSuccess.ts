// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { EventInfo, SharedFolderData, StreamingState, Tariff } from '@opentalk/rest-api-rtk-query';

import type { ParticipationLogging } from '../../api/types/outgoing/trainingParticipationReport';
import { InitialAutomod } from '../automod';
import { InitialBreakout } from '../breakout';
import { InitialChat } from '../chat';
import {
  BackendParticipant,
  ForceMute,
  GroupId,
  ParticipantId,
  ParticipantMediaState,
  Role,
  Timestamp,
} from '../common';
import { RoomInfo } from '../event';
import { LegalVoteJoinSuccess, VoteSummary } from '../legalVote';
import { Participant } from '../participant';
import { InitialPoll } from '../poll';
import { TimerState } from '../timer';
import { WhiteboardState } from '../whiteboard';

export interface JoinSuccessInternalState {
  participantId: ParticipantId;
  role: Role;
  avatarUrl?: string;
  chat: InitialChat;
  groups: GroupId[];
  automod?: InitialAutomod;
  breakout?: InitialBreakout;
  polls?: InitialPoll;
  votes?: Array<VoteSummary>;
  participants: Participant[];
  moderation?: {
    raiseHandsEnabled: boolean;
    waitingRoomEnabled: boolean;
    waitingRoomParticipants: Array<BackendParticipant>;
  };
  forceMute?: ForceMute;
  recording?: StreamingState;
  serverTimeOffset: number;
  tariff: Tariff;
  timer?: TimerState;
  sharedFolder: SharedFolderData;
  eventInfo?: EventInfo;
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
    waitingRoomParticipants: Array<BackendParticipant>;
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
