// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { ListenerEffectAPI } from '@reduxjs/toolkit';

import { notifications } from '../../commonComponents';
import { TimerStyle, TimerStopKind } from '../../types';
import type { AppDispatch, RootState } from '../index';
import { timerStopped } from './timerSlice';
import { handleNotificationOnTimerStoppedEffect } from './timerSlice';

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
  describe('timer listeners', () => {
    describe('handleNotificationOnTimerStoppedEffect', () => {
      beforeEach(() => {
        vi.clearAllMocks();
      });

      it('should notify when timer stops due to expiration', () => {
        const action = timerStopped({ kind: TimerStopKind.Expired });
        const listenerApi = getMockListenerApi(TimerStyle.Normal);
        handleNotificationOnTimerStoppedEffect(action, listenerApi);

        expect(notifications.info).toHaveBeenCalledWith('timer-notification-ran-out');
      });

      it('should notify when timer is stopped by moderator', () => {
        const action = timerStopped({ kind: TimerStopKind.ByModerator });
        const listenerApi = getMockListenerApi(TimerStyle.Normal);

        handleNotificationOnTimerStoppedEffect(action, listenerApi);

        expect(notifications.info).toHaveBeenCalledWith('timer-notification-stopped');
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

        expect(notifications.info).toHaveBeenCalledWith('coffee-break-notification');
      });
    });
  });
});
