// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { ListenerEffectAPI } from '@reduxjs/toolkit';
import { Duration, intervalToDuration } from 'date-fns';
import i18next from 'i18next';

import { ReadyToContinue } from '../../api/types/incoming/timer';
import { notifications } from '../../commonComponents';
import { ParticipantId, TimerKind, TimerStopKind, TimerStyle, Timestamp } from '../../types';
import { hangUp, joinSuccess } from '../commonActions';
import type { AppDispatch, RootState } from '../index';
import type { StartAppListening } from '../listenerMiddleware';

export type State = {
  startedAt?: Timestamp;
  endsAt?: Timestamp;
  participantsReady: Array<ParticipantId>;
  readyCheckEnabled?: boolean;
  title?: string;
  kind?: TimerKind;
  style?: TimerStyle;
  totalDuration?: Duration;
  timerStopKind?: TimerStopKind;
};

const initialState: State = {
  startedAt: undefined,
  endsAt: undefined,
  participantsReady: [],
  readyCheckEnabled: undefined,
  title: undefined,
  kind: undefined,
  style: undefined,
  totalDuration: undefined,
  timerStopKind: undefined,
};

export const timerSlice = createSlice({
  name: 'timer',
  initialState: initialState,
  reducers: {
    resetTimerState: () => initialState,
    updateParticipantsReady: (state, { payload }: PayloadAction<ReadyToContinue>) => {
      if (payload.status === true && !state.participantsReady.includes(payload.participantId)) {
        state.participantsReady.push(payload.participantId);
        return;
      }
      if (payload.status === false) {
        state.participantsReady = state.participantsReady.filter(
          (item: ParticipantId) => item !== payload.participantId
        );
      }
    },
    timerStarted: (state, { payload }) => {
      state.startedAt = payload.startedAt;
      state.endsAt = payload.endsAt;
      state.readyCheckEnabled = payload.readyCheckEnabled;
      state.title = payload.title;
      state.kind = payload.kind;
      state.style = payload.style;
      if (payload.endsAt) {
        state.totalDuration = intervalToDuration({
          start: new Date(payload.startedAt),
          end: new Date(payload.endsAt),
        });
      }
      state.timerStopKind = undefined;
    },
    timerStopped: (state, { payload }) => {
      state.startedAt = undefined;
      state.endsAt = undefined;
      state.readyCheckEnabled = undefined;
      state.title = undefined;
      state.kind = undefined;
      state.style = undefined;
      state.totalDuration = undefined;
      state.participantsReady = [];
      state.timerStopKind = payload.kind;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(joinSuccess, (state, { payload: { participantId, participantsReady, timer } }) => {
      if (timer) {
        state.startedAt = timer.startedAt;
        state.endsAt = timer.endsAt;
        state.kind = timer.kind;
        state.readyCheckEnabled = timer.readyCheckEnabled;
        state.style = timer.style;
        state.participantsReady = participantsReady;
        state.title = timer.title;
        if (timer.readyStatus === true) {
          state.participantsReady.push(participantId);
        }
        if (timer.endsAt) {
          state.totalDuration = intervalToDuration({
            start: new Date(timer.startedAt),
            end: new Date(timer.endsAt),
          });
        }
        state.timerStopKind = undefined;
      }
    });
    builder.addCase(hangUp.fulfilled, () => initialState);
  },
});

export const { updateParticipantsReady, resetTimerState, timerStarted, timerStopped } = timerSlice.actions;

export const actions = timerSlice.actions;

export const selectTimerStartedAt = (state: RootState) => state.timer.startedAt;
export const selectTimerEndsAt = (state: RootState) => state.timer.endsAt;
export const selectParticipantsReady = (state: RootState) => state.timer.participantsReady;
export const selectReadyCheckEnabled = (state: RootState) => state.timer.readyCheckEnabled;
export const selectTimerTitle = (state: RootState) => state.timer.title;
export const selectTimerActive = (state: RootState) => state.timer.startedAt && !state.timer.timerStopKind;
export const selectTimerKind = (state: RootState) => state.timer.kind;
export const selectTimerStyle = (state: RootState) => state.timer.style;
export const selectTotalDuration = (state: RootState) => state.timer.totalDuration;

export default timerSlice.reducer;

/************************************************/
/*                                              */
/*                  Listeners                   */
/*                                              */
/************************************************/

export const handleNotificationOnTimerStoppedEffect = (
  action: ReturnType<typeof timerStopped>,
  listenerApi: ListenerEffectAPI<RootState, AppDispatch>
) => {
  const timerStyle = listenerApi.getOriginalState().timer.style;
  if (timerStyle === TimerStyle.Normal) {
    switch (action.payload.kind) {
      case TimerStopKind.Expired:
        notifications.info(i18next.t('timer-notification-ran-out'));
        break;
      case TimerStopKind.ByModerator:
        notifications.info(i18next.t('timer-notification-stopped'));
        break;
      case TimerStopKind.CreatorLeft:
        break;
    }
  }
  if (timerStyle === TimerStyle.CoffeeBreak) {
    notifications.info(i18next.t('coffee-break-notification'));
  }
};

const startNotificationOnTimerStopListener = (startAppListening: StartAppListening) =>
  startAppListening({
    actionCreator: timerStopped,
    effect: handleNotificationOnTimerStoppedEffect,
  });

export const startTimerListeners = (startAppListening: StartAppListening) => {
  startNotificationOnTimerStopListener(startAppListening);
};
