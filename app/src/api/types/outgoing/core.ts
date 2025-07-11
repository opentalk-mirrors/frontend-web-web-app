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
}

export type Action = EnterRoom;

export type Core = Namespaced<Action, 'core'>;

export const enterRoom = createSignalingApiCall<EnterRoom>('core', 'enter_room');

export const handler = createModule<RootState>((builder) => {
  builder.addCase(enterRoom.action, () => {
    sendMessage(enterRoom());
  });
});

export default Core;
