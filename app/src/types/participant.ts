// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { BreakoutRoomId } from './breakout';
import { ConnectionId, ParticipantId, ParticipationKind, Role, WaitingState } from './common';
import { MeetingNotesAccess } from './meetingNotes';

export interface Participant {
  id: ParticipantId;
  connections: ConnectionId[];
  breakoutRoomId?: BreakoutRoomId;
  displayName: string;
  avatarUrl?: string;
  handIsUp?: boolean;
  joinedAt: string;
  leftAt: string | null;
  handUpdatedAt?: string;
  participationKind: ParticipationKind;
  lastActive: string;
  role?: Role;
  waitingState: WaitingState;
  meetingNotesAccess: MeetingNotesAccess;
  isRoomOwner: boolean;
}

export type FilterableParticipant = Pick<Participant, 'displayName'>;
