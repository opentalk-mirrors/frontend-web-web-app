// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { notifications } from '../../commonComponents';
import i18n from '../../i18n';
import type { RootState } from '../../store';
import {
  canceled as legalVoteCanceled,
  started as legalVoteStarted,
  stopped as legalVoteStopped,
  updated as legalVoteUpdated,
  voted as legalVoteVoted,
} from '../../store/slices/legalVoteSlice';
import {
  ErrorStruct,
  LegalVoteId,
  LegalVoteOption,
  MeetingNotesAccess,
  Participant,
  ParticipantId,
  ParticipationKind,
  Timestamp,
  VoteCancelReason,
  VoteInvalidReason,
  WaitingState,
} from '../../types';
import type {
  LegalVoteMessageType,
  VoteCanceled,
  VoteReportedIssue,
  VoteStopped,
  VoteUpdated,
  VoteStarted,
  VoteResponse,
} from '../types/incoming/legalVote';
import { LegalVoteError, StopKind, VoteFinalResults } from '../types/incoming/legalVote';
import { ReportIssueKind } from '../types/outgoing/legalVote';
import { handleLegalVoteMessage } from './legalVote';

vi.mock('i18next', () => ({
  default: {
    t: vi.fn((key: string) => key),
  },
}));

vi.mock('../../i18n', () => ({
  default: {
    t: vi.fn((key: string) => key),
  },
}));

vi.mock('../../commonComponents', () => ({
  notifications: {
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  },
}));

const createState = (overrides: Partial<RootState> = {}) =>
  ({
    participants: {
      entities: {},
    },
    user: {
      uuid: 'user-1' as ParticipantId,
    },
    ...overrides,
  }) as RootState;

const baseVote = {
  legalVoteId: 'vote-1' as LegalVoteId,
  initiatorId: 'user-1' as ParticipantId,
  startTime: '2024-01-01T10:00:00Z' as Timestamp,
  maxVotes: 1,
  name: 'Test Vote',
  enableAbstain: true,
  autoClose: false,
  duration: undefined,
  createPdf: false,
  allowedParticipants: [],
  pseudonymous: false,
  live: false,
};

const createParticipant = (id: ParticipantId, displayName: string): Participant => ({
  id,
  connections: [],
  breakoutRoomId: undefined,
  displayName,
  handIsUp: false,
  joinedAt: '2024-01-01T10:00:00Z' as Timestamp,
  leftAt: null,
  groups: [],
  participationKind: ParticipationKind.Registered,
  lastActive: '2024-01-01T10:00:00Z',
  waitingState: WaitingState.Joined,
  meetingNotesAccess: MeetingNotesAccess.None,
  isRoomOwner: false,
});

describe('handleLegalVoteMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('dispatches started messages', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: VoteStarted = { message: 'started', ...baseVote };

    handleLegalVoteMessage(dispatch, data, state);

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(legalVoteStarted(data));
  });

  it('dispatches updated messages', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: VoteUpdated = {
      message: 'updated',
      legalVoteId: baseVote.legalVoteId,
      yes: 1,
      no: 0,
      abstain: 0,
      votingRecord: {},
    };

    handleLegalVoteMessage(dispatch, data, state);

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(legalVoteUpdated(data));
  });

  it('dispatches stopped messages and warns on invalid results', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: VoteStopped = {
      message: 'stopped',
      legalVoteId: baseVote.legalVoteId,
      kind: StopKind.Auto,
      results: VoteFinalResults.Invalid,
      reason: VoteInvalidReason.ProtocolInconsistent,
      endTime: '2024-01-01T11:00:00Z' as Timestamp,
      yes: 1,
      no: 0,
      votingRecord: {},
    };

    handleLegalVoteMessage(dispatch, data, state);

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(legalVoteStopped(data));
    expect(notifications.info).toHaveBeenCalledExactlyOnceWith('legal-vote-stopped');
    expect(notifications.warning).toHaveBeenCalledExactlyOnceWith('legal-vote-stopped-invalid-results-notification');
  });

  it('dispatches canceled messages', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: VoteCanceled = {
      message: 'canceled',
      legalVoteId: baseVote.legalVoteId,
      reason: VoteCancelReason.RoomDestroyed,
      endTime: '2024-01-01T11:00:00Z' as Timestamp,
    };

    handleLegalVoteMessage(dispatch, data, state);

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(legalVoteCanceled(data));
    expect(notifications.error).toHaveBeenCalledExactlyOnceWith('legal-vote-canceled');
  });

  it('dispatches successful vote submissions', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: VoteResponse = {
      message: 'voted',
      legalVoteId: baseVote.legalVoteId,
      voteOption: LegalVoteOption.Yes,
      issuer: 'user-2' as ParticipantId,
      consumedToken: 'token',
    };

    handleLegalVoteMessage(dispatch, data, state);

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(legalVoteVoted(data));
  });

  it('notifies when a vote fails', () => {
    const dispatch = vi.fn();
    const state = createState();
    const error: ErrorStruct<LegalVoteError> = {
      message: 'error',
      error: LegalVoteError.InvalidVoteId,
    };

    handleLegalVoteMessage(dispatch, error, state);

    expect(notifications.error).toHaveBeenCalledExactlyOnceWith('invalid-vote-id-error');
  });

  it('notifies about reported issues from other participants', () => {
    const dispatch = vi.fn();
    const state = createState({
      participants: {
        ids: ['user-2' as ParticipantId],
        entities: {
          ['user-2' as ParticipantId]: createParticipant('user-2' as ParticipantId, 'Pat'),
        },
      },
    });
    const data: VoteReportedIssue = {
      message: 'reported_issue',
      participantId: 'user-2' as ParticipantId,
      kind: ReportIssueKind.Video,
      legalVoteId: baseVote.legalVoteId,
    };

    handleLegalVoteMessage(dispatch, data, state);

    expect(i18n.t).toHaveBeenCalledWith('legal-vote-report-issue-kind-notification', {
      displayName: 'Pat',
      kind: 'video',
    });
    expect(notifications.warning).toHaveBeenCalledExactlyOnceWith('legal-vote-report-issue-kind-notification');
  });

  it('throws on unknown message type', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data = { message: 'unknown' } as unknown as LegalVoteMessageType;

    expect(() => handleLegalVoteMessage(dispatch, data, state)).toThrow(/Unknown message type/);
  });
});
