// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { ListenerEffectAPI } from '@reduxjs/toolkit';
import { intervalToDuration } from 'date-fns';

import { SwitchedRoom } from '../../api/types/incoming/breakout';
import { notifications } from '../../commonComponents';
import {
  JoinSuccessInternalState,
  ParticipantId,
  TimerKind,
  TimerState,
  TimerStyle,
  TimerStopKind,
  Timestamp,
} from '../../types';
import { joinSuccess } from '../commonActions';
import type { AppDispatch, RootState } from '../index';
import { switchedRoom } from './breakoutSlice';
import reducer, { timerStopped } from './timerSlice';
import { handleNotificationOnTimerStoppedEffect } from './timerSlice';

type SwitchedRoomPayload = Omit<SwitchedRoom, 'message'>;

const buildTimer = (overrides: Partial<TimerState> = {}): TimerState => ({
  startedAt: '2024-01-01T00:00:00Z' as Timestamp,
  endsAt: '2024-01-01T00:05:00Z' as Timestamp,
  kind: TimerKind.Countdown,
  readyCheckEnabled: true,
  readyStatus: false,
  style: TimerStyle.Normal,
  title: 'Focus time',
  ...overrides,
});

const buildJoinSuccessPayload = (
  overrides: { timer?: TimerState; participantId?: ParticipantId; participantsReady?: ParticipantId[] } = {}
): JoinSuccessInternalState =>
  ({
    participantId: overrides.participantId ?? ('participant-1' as ParticipantId),
    participantsReady: overrides.participantsReady ?? [],
    timer: overrides.timer,
  }) as unknown as JoinSuccessInternalState;

const initialState = reducer(undefined, { type: '@@INIT' });

vi.mock('../../commonComponents', () => ({
  notifications: {
    info: vi.fn(),
  },
}));

vi.mock('i18next', () => ({
  default: {
    t: (key: string) => key,
  },
}));

const getMockListenerApi = (style: TimerStyle) =>
  ({
    getOriginalState: vi.fn(() => ({
      timer: { style },
    })),
  }) as unknown as ListenerEffectAPI<RootState, AppDispatch>;

describe('timer slice', () => {
  describe('joinSuccess', () => {
    it('sets the timer state to the values received in the join payload', () => {
      const timer = buildTimer();

      const state = reducer(
        undefined,
        joinSuccess(
          buildJoinSuccessPayload({
            timer,
            participantId: 'participant-1' as ParticipantId,
            participantsReady: ['participant-2' as ParticipantId],
          })
        )
      );

      expect(state).toEqual({
        startedAt: timer.startedAt,
        endsAt: timer.endsAt,
        kind: timer.kind,
        readyCheckEnabled: timer.readyCheckEnabled,
        style: timer.style,
        title: timer.title,
        participantsReady: ['participant-2'],
        totalDuration: intervalToDuration({ start: new Date(timer.startedAt), end: new Date(timer.endsAt) }),
        timerStopKind: undefined,
      });
    });

    it('marks the joining participant as ready when the join payload reports readyStatus', () => {
      const timer = buildTimer({ readyStatus: true });

      const state = reducer(
        undefined,
        joinSuccess(
          buildJoinSuccessPayload({
            timer,
            participantId: 'participant-1' as ParticipantId,
            participantsReady: ['participant-2' as ParticipantId],
          })
        )
      );

      expect(state.participantsReady).toEqual(['participant-2', 'participant-1']);
    });

    it('clears the timer state when the join payload has no timer', () => {
      const populatedState = reducer(
        undefined,
        joinSuccess(
          buildJoinSuccessPayload({ timer: buildTimer(), participantsReady: ['participant-2' as ParticipantId] })
        )
      );

      const state = reducer(populatedState, joinSuccess(buildJoinSuccessPayload()));

      expect(state).toEqual(initialState);
    });
  });

  describe('switchedRoom', () => {
    it('clears the timer when switching to a room without a timer', () => {
      const populatedState = reducer(undefined, joinSuccess(buildJoinSuccessPayload({ timer: buildTimer() })));

      const state = reducer(populatedState, switchedRoom({ ownData: undefined } as unknown as SwitchedRoomPayload));

      expect(state).toEqual(initialState);
    });

    it('applies the destination room timer when switching to a room that has one', () => {
      const timer = buildTimer({ title: 'Breakout timer' });

      const state = reducer(
        initialState,
        switchedRoom({
          ownData: { timer },
          peerData: {
            'participant-1': { timer: { readyStatus: true } },
            'participant-2': { timer: { readyStatus: false } },
            'participant-3': {},
          },
        } as unknown as SwitchedRoomPayload)
      );

      expect(state).toEqual({
        startedAt: timer.startedAt,
        endsAt: timer.endsAt,
        kind: timer.kind,
        readyCheckEnabled: timer.readyCheckEnabled,
        style: timer.style,
        title: timer.title,
        participantsReady: [],
        totalDuration: intervalToDuration({ start: new Date(timer.startedAt), end: new Date(timer.endsAt) }),
        timerStopKind: undefined,
      });
    });
  });

  describe('timer listeners', () => {
    describe('handleNotificationOnTimerStoppedEffect', () => {
      beforeEach(() => {
        vi.clearAllMocks();
      });

      it('should notify when timer stops due to expiration', () => {
        const action = timerStopped({ kind: TimerStopKind.Expired });
        const listenerApi = getMockListenerApi(TimerStyle.Normal);
        handleNotificationOnTimerStoppedEffect(action, listenerApi);

        expect(notifications.info).toHaveBeenCalledExactlyOnceWith('timer-notification-ran-out');
      });

      it('should notify when timer is stopped by moderator', () => {
        const action = timerStopped({ kind: TimerStopKind.ByModerator });
        const listenerApi = getMockListenerApi(TimerStyle.Normal);

        handleNotificationOnTimerStoppedEffect(action, listenerApi);

        expect(notifications.info).toHaveBeenCalledExactlyOnceWith('timer-notification-stopped');
      });

      it('should not notify when timer is stopped because the creator left', () => {
        const action = timerStopped({ kind: TimerStopKind.CreatorLeft });
        const listenerApi = getMockListenerApi(TimerStyle.Normal);
        handleNotificationOnTimerStoppedEffect(action, listenerApi);

        expect(notifications.info).not.toHaveBeenCalled();
      });

      it('should notify for coffee break timer style', () => {
        const action = timerStopped({ kind: TimerStopKind.Expired });
        const listenerApi = getMockListenerApi(TimerStyle.CoffeeBreak);
        handleNotificationOnTimerStoppedEffect(action, listenerApi);

        expect(notifications.info).toHaveBeenCalledExactlyOnceWith('coffee-break-notification');
      });
    });
  });
});
