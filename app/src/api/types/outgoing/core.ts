// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { RootState } from '../../../store';
import { createModule, Namespaced } from '../../../types';
import { createSignalingApiCall } from '../../createSignalingApiCall';
import { sendMessage } from './common';

export type DisplayName = string & { readonly __tag: unique symbol };

export interface EnterRoom {
  action: 'enter_room';
  displayName?: string;
}

export interface EnterWaitingRoom {
  action: 'enter_waiting_room';
  displayName?: string;
}

export type Action = EnterRoom | EnterWaitingRoom;

export type Core = Namespaced<Action, 'core'>;

export const enterRoom = createSignalingApiCall<EnterRoom>('core', 'enter_room');
export const enterWaitingRoom = createSignalingApiCall<EnterWaitingRoom>('core', 'enter_waiting_room');

export const handler = createModule<RootState>((builder) => {
  builder
    .addCase(enterRoom.action, (_state, action) => {
      sendMessage(enterRoom(action.payload));
    })
    .addCase(enterWaitingRoom.action, (_state, action) => {
      sendMessage(enterWaitingRoom(action.payload));
    });
});

export default Core;
