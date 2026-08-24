// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { notifications } from '../../commonComponents';
import { timerStarted, timerStopped, updateParticipantsReady } from '../../store/slices/timerSlice';
import { ParticipantId, TimerStopKind, Timestamp } from '../../types';
import type { Message as TimerMessage, ReadyToContinue } from '../types/incoming/timer';
import { TimerError } from '../types/incoming/timer';
import { handleTimerMessage } from './timer';

vi.mock('i18next', () => ({
  default: {
    t: vi.fn((key: string) => key),
  },
}));
vi.mock('../../logger', () => ({
  default: {
    error: vi.fn(),
  },
}));
vi.mock('../../commonComponents', () => ({
  notifications: {
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
      participantId: 'participant-1' as ParticipantId,
      status: true,
    };

    handleTimerMessage(dispatch, data);

    expect(dispatch).toHaveBeenCalledExactlyOnceWith(updateParticipantsReady(data));
  });

  it.each([
    [TimerError.InvalidDuration, 'timer-error-invalid-duration'],
    [TimerError.InsufficientPermissions, 'timer-error-insufficient-permissions'],
    [TimerError.TimerAlreadyRunning, 'timer-error-already-running'],
    [TimerError.TimerNotRunning, 'timer-error-not-running'],
    [TimerError.ReadyCheckNotEnabled, 'timer-error-ready-check-not-enabled'],
    [TimerError.Internal, 'timer-error-internal'],
  ])('shows an error notification for the %s error without throwing', (error, translationKey) => {
    const dispatch = vi.fn();
    const data: TimerMessage = { message: 'error', error };

    expect(() => handleTimerMessage(dispatch, data)).not.toThrow();
    expect(dispatch).not.toHaveBeenCalled();
    expect(notifications.error).toHaveBeenCalledWith(translationKey);
  });

  it('throws on unknown message type', () => {
    const dispatch = vi.fn();
    const data = { message: 'unknown' } as unknown as TimerMessage;

    expect(() => handleTimerMessage(dispatch, data)).toThrow(/Unknown message type/);
  });
});
