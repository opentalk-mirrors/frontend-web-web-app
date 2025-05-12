// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ListenerEffectAPI } from '@reduxjs/toolkit';

import { notifications } from '../../commonComponents';
import { TimerStyle, TimerStopKind } from '../../types';
import { configureStore } from '../../utils/testUtils';
import type { AppDispatch, RootState } from '../index';
import { timerStopped } from './timerSlice';
import { handleNotificationOnTimerStoppedEffect } from './timerSlice';

jest.mock('../../commonComponents', () => ({
  notifications: {
    info: jest.fn(),
  },
}));

describe('timer slice', () => {
  describe('timer listeners', () => {
    describe('handleNotificationOnTimerStoppedEffect', () => {
      let mockListenerApi: jest.Mocked<ListenerEffectAPI<RootState, AppDispatch>>;
      let initialState: RootState;

      beforeEach(() => {
        const { store } = configureStore();
        initialState = store.getState();

        mockListenerApi = {
          ...jest.requireActual('@reduxjs/toolkit').ListenerEffectAPI,
          getOriginalState: jest.fn(() => ({
            ...initialState,
            timer: {
              ...initialState.timer,
              style: TimerStyle.Normal,
            },
          })),
        };

        jest.clearAllMocks();
      });

      it('should notify when timer stops due to expiration', () => {
        const mockTimerStoppedAction: ReturnType<typeof timerStopped> = timerStopped({ kind: TimerStopKind.Expired });
        handleNotificationOnTimerStoppedEffect(mockTimerStoppedAction, mockListenerApi);
        expect(notifications.info).toHaveBeenCalledWith('timer-notification-ran-out');
      });

      it('should notify when timer is stopped by moderator', () => {
        const mockTimerStoppedAction: ReturnType<typeof timerStopped> = timerStopped({
          kind: TimerStopKind.ByModerator,
        });
        handleNotificationOnTimerStoppedEffect(mockTimerStoppedAction, mockListenerApi);
        expect(notifications.info).toHaveBeenCalledWith('timer-notification-stopped');
      });

      it('should not notify when timer is stopped because the creator left', () => {
        const mockTimerStoppedAction: ReturnType<typeof timerStopped> = timerStopped({
          kind: TimerStopKind.CreatorLeft,
        });
        handleNotificationOnTimerStoppedEffect(mockTimerStoppedAction, mockListenerApi);
        expect(notifications.info).not.toHaveBeenCalled();
      });

      it('should notify for coffee break timer style', () => {
        mockListenerApi.getOriginalState.mockReturnValueOnce({
          ...initialState,
          timer: {
            ...initialState.timer,
            style: TimerStyle.CoffeeBreak,
          },
        });
        const mockTimerStoppedAction: ReturnType<typeof timerStopped> = timerStopped({ kind: TimerStopKind.Expired });
        handleNotificationOnTimerStoppedEffect(mockTimerStoppedAction, mockListenerApi);
        expect(notifications.info).toHaveBeenCalledWith('coffee-break-notification');
      });
    });
  });
});
