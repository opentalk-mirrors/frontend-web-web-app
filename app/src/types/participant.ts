// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { BreakoutRoomId } from './breakout';
import { ConnectionId, GroupId, ParticipantId, ParticipationKind, Role, WaitingState } from './common';
import { MeetingNotesAccess } from './meetingNotes';

export interface Participant {
  id: ParticipantId;
  connections: ConnectionId[];
  breakoutRoomId: BreakoutRoomId | null;
  displayName: string;
  avatarUrl?: string;
  handIsUp?: boolean;
  joinedAt: string;
  leftAt: string | null;
  handUpdatedAt?: string;
  groups: GroupId[];
  participationKind: ParticipationKind;
  lastActive: string;
  role?: Role;
  waitingState: WaitingState;
  meetingNotesAccess: MeetingNotesAccess;
  isRoomOwner: boolean;
}

export type FilterableParticipant = Pick<Participant, 'displayName'>;
