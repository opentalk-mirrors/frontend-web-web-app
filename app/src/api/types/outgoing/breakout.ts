// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
//! Incoming Breakout Room related actions
import { createAction } from '@reduxjs/toolkit';

import type { RootState } from '../../../store';
import { Namespaced, ParticipantId, createModule } from '../../../types';
import { Seconds } from '../../../utils/tsUtils';
import { Action as IAction, createSignalingApiCall } from '../../createSignalingApiCall';
import { sendMessage } from './common';

export interface BreakoutRoom {
  name: string;
  assignments: ParticipantId[];
}

export interface StartActionParticipantsChose extends IAction {
  action: 'start';
  rooms: number;
  duration?: Seconds;
  strategy: 'let_participants_choose';
}

export interface StartActionManual extends IAction {
  action: 'start';
  duration?: Seconds;
  strategy: 'manual';
  rooms: BreakoutRoom[];
}

export type StartAction = StartActionManual | StartActionParticipantsChose;

export const startAny = createAction<Omit<StartActionManual, 'action'>>('start');
export interface StopAction extends IAction {
  action: 'stop';
}

export type Action = StartAction | StopAction;
export type Breakout = Namespaced<Action, 'breakout'>;

export const start = createSignalingApiCall<StartAction>('breakout', 'start');
export const stop = createSignalingApiCall<StopAction>('breakout', 'stop');

export const handler = createModule<RootState>((builder) => {
  builder.addCase(start.action, (_state, action) => {
    sendMessage(start(action.payload));
  });
  builder.addCase(stop.action, (_state, action) => {
    sendMessage(stop(action.payload));
  });
});

export default Breakout;
