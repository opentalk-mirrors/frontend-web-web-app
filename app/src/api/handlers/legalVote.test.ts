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
  LegalVoteId,
  LegalVoteKind,
  MeetingNotesAccess,
  Participant,
  ParticipantId,
  ParticipationKind,
  VoteCancelReason,
  VoteInvalidReason,
  WaitingState,
} from '../../types';
import type {
  LegalVoteMessageType,
  VoteCanceled,
  VoteFailedType,
  VoteReportedIssue,
  VoteStopped,
  VoteStoppedAuto,
  VoteSuccessType,
  VoteUpdated,
  VoteStarted,
} from '../types/incoming/legalVote';
import { LegalVoteError, VoteFinalResults } from '../types/incoming/legalVote';
import { showErrorNotification } from './helpers';
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

vi.mock('./helpers', () => ({
  showErrorNotification: vi.fn(),
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
  startTime: '2024-01-01T10:00:00Z',
  maxVotes: 1,
  kind: LegalVoteKind.RollCall,
  name: 'Test Vote',
  enableAbstain: true,
  autoClose: false,
  duration: null,
  createPdf: false,
  allowedParticipants: [],
};

const createParticipant = (id: ParticipantId, displayName: string): Participant => ({
  id,
  breakoutRoomId: null,
  displayName,
  handIsUp: false,
  joinedAt: '2024-01-01T10:00:00Z',
  leftAt: null,
  handUpdatedAt: '2024-01-01T10:00:00Z',
  groups: [],
  participationKind: ParticipationKind.User,
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
      kind: 'auto' as VoteStoppedAuto['kind'],
      results: VoteFinalResults.Invalid,
      reason: VoteInvalidReason.ProtocolInconsistent,
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
    };

    handleLegalVoteMessage(dispatch, data, state);

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(legalVoteCanceled(data));
    expect(notifications.error).toHaveBeenCalledExactlyOnceWith('legal-vote-canceled');
  });

  it('dispatches successful vote submissions', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: VoteSuccessType = {
      message: 'voted',
      legalVoteId: baseVote.legalVoteId,
      response: 'success',
      voteOption: 'yes',
      issuer: 'user-2' as ParticipantId,
      consumedToken: 'token',
    };

    handleLegalVoteMessage(dispatch, data, state);

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(legalVoteVoted(data));
  });

  it('notifies when a vote fails', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: VoteFailedType = {
      message: 'voted',
      legalVoteId: baseVote.legalVoteId,
      response: 'failed',
      reason: 'invalid_vote_id' as VoteFailedType['reason'],
    };

    handleLegalVoteMessage(dispatch, data, state);

    expect(notifications.error).toHaveBeenCalledExactlyOnceWith('legal-vote-error');
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
      kind: 'video',
    };

    handleLegalVoteMessage(dispatch, data, state);

    expect(i18n.t).toHaveBeenCalledWith('legal-vote-report-issue-kind-notification', {
      displayName: 'Pat',
      kind: 'video',
    });
    expect(notifications.warning).toHaveBeenCalledExactlyOnceWith('legal-vote-report-issue-kind-notification');
  });

  it('routes error events through helper', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data: LegalVoteMessageType = { message: 'error', error: LegalVoteError.Internal };

    handleLegalVoteMessage(dispatch, data, state);

    expect(showErrorNotification).toHaveBeenCalledExactlyOnceWith(LegalVoteError.Internal);
  });

  it('throws on unknown message type', () => {
    const dispatch = vi.fn();
    const state = createState();
    const data = { message: 'unknown' } as unknown as LegalVoteMessageType;

    expect(() => handleLegalVoteMessage(dispatch, data, state)).toThrow(/Unknown message type/);
  });
});
