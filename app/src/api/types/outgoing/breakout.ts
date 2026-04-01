// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
//! Incoming Breakout Room related actions
import type { RootState } from '../../../store';
import { Namespaced, ParticipantId, RoomKindBreakout, RoomKindMain, createModule } from '../../../types';
import { Seconds } from '../../../utils/tsUtils';
import { createSignalingApiCall } from '../../createSignalingApiCall';
import { sendMessage } from './common';

export interface BreakoutRoomConfig {
  name: string;
  assignments: ParticipantId[];
}

export interface StartAction {
  action: 'start';
  rooms: BreakoutRoomConfig[];
  duration?: Seconds;
}

interface SwitchRoomBase {
  action: 'switch_room';
}

export type SwitchRoomToMain = SwitchRoomBase & RoomKindMain;

export type SwitchRoomToBreakout = SwitchRoomBase & RoomKindBreakout;

export type SwitchRoom = SwitchRoomToMain | SwitchRoomToBreakout;

export interface StopAction {
  action: 'stop';
  delay?: number;
}

export type Action = StartAction | SwitchRoom | StopAction;
export type Breakout = Namespaced<Action, 'breakout'>;

export const start = createSignalingApiCall<StartAction>('breakout', 'start');
export const switchRoom = createSignalingApiCall<SwitchRoom>('breakout', 'switch_room');
export const stop = createSignalingApiCall<StopAction>('breakout', 'stop');

export const handler = createModule<RootState>((builder) => {
  builder
    .addCase(start.action, (_state, action) => {
      sendMessage(start(action.payload));
    })
    .addCase(switchRoom.action, (_state, action) => {
      sendMessage(switchRoom(action.payload));
    })
    .addCase(stop.action, (_state, action) => {
      sendMessage(stop(action.payload));
    });
});

export default Breakout;
