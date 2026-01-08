// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { timerStarted, timerStopped, updateParticipantsReady } from '../../store/slices/timerSlice';
import { ForceMuteType, ParticipantId, ParticipationKind, TimerStopKind, Timestamp } from '../../types';
import type { Message as TimerMessage, ReadyToContinue } from '../types/incoming/timer';
import { handleTimerMessage } from './timer';

vi.mock('../../logger', () => ({
  default: {
    error: vi.fn(),
  },
}));

describe('handleTimerMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('dispatches timer started', () => {
    const dispatch = vi.fn();
    const data: TimerMessage = {
      message: 'started',
      timerId: 'timer-1',
      readyCheckEnabled: true,
      startedAt: '2024-01-01T10:00:00Z' as Timestamp,
    };

    handleTimerMessage(dispatch, data);

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(timerStarted(data));
  });

  it('dispatches timer stopped', () => {
    const dispatch = vi.fn();
    const data: TimerMessage = {
      message: 'stopped',
      kind: TimerStopKind.ByModerator,
      participantId: 'moderator-1' as ParticipantId,
    };

    handleTimerMessage(dispatch, data);

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(timerStopped(data));
  });

  it('dispatches readiness updates', () => {
    const dispatch = vi.fn();
    const data: ReadyToContinue = {
      message: 'updated_ready_status',
      id: 'participant-1' as ParticipantId,
      participantId: 'participant-1' as ParticipantId,
      status: true,
      control: {
        displayName: 'Alex',
        avatarUrl: 'https://avatar.example',
        handIsUp: false,
        joinedAt: '2024-01-01T10:00:00Z',
        leftAt: null,
        handUpdatedAt: '2024-01-01T10:00:00Z',
        participationKind: ParticipationKind.User,
        isRoomOwner: false,
      },
      media: {
        forceMute: {
          type: ForceMuteType.Disabled,
          unrestrictedParticipants: [],
        },
      },
    };

    handleTimerMessage(dispatch, data);

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(updateParticipantsReady(data));
  });

  it('throws on unknown message type', () => {
    const dispatch = vi.fn();
    const data = { message: 'unknown' } as unknown as TimerMessage;

    expect(() => handleTimerMessage(dispatch, data)).toThrow(/Unknown message type/);
  });
});
