// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { RootState } from '../../../store';
import { createModule, Namespaced, ParticipantId } from '../../../types';
import { createSignalingApiCall } from '../../createSignalingApiCall';
import { sendMessage } from './common';

export type DisplayName = string;

export interface Join {
  action: 'join';
  displayName: DisplayName;
  avatarUrl?: string;
}

export interface RaiseHand {
  action: 'raise_hand';
}

export interface LowerHand {
  action: 'lower_hand';
}

export interface GrantModeratorRole {
  action: 'grant_moderator_role';
  target: ParticipantId;
}

export interface RevokeModeratorRole {
  action: 'revoke_moderator_role';
  target: ParticipantId;
}

export interface EnterRoom {
  action: 'enter_room';
}

export type Action = Join | RaiseHand | LowerHand | GrantModeratorRole | RevokeModeratorRole | EnterRoom;

export type Control = Namespaced<Action, 'control'>;

export const join = createSignalingApiCall<Join>('control', 'join');
export const raiseHand = createSignalingApiCall<RaiseHand>('control', 'raise_hand');
export const lowerHand = createSignalingApiCall<LowerHand>('control', 'lower_hand');
export const grantModeratorRole = createSignalingApiCall<GrantModeratorRole>('control', 'grant_moderator_role');
export const revokeModeratorRole = createSignalingApiCall<RevokeModeratorRole>('control', 'revoke_moderator_role');
export const enterRoom = createSignalingApiCall<EnterRoom>('control', 'enter_room');

export const handler = createModule<RootState>((builder) => {
  builder
    .addCase(join.action, (_state, action) => {
      sendMessage(join(action.payload));
    })
    .addCase(raiseHand.action, () => {
      sendMessage(raiseHand());
    });
  builder
    .addCase(enterRoom.action, () => {
      sendMessage(enterRoom());
    })
    .addCase(lowerHand.action, () => {
      sendMessage(lowerHand());
    })
    .addCase(grantModeratorRole.action, (_state, { payload: { target } }) => {
      sendMessage(grantModeratorRole({ target: target }));
    })
    .addCase(revokeModeratorRole.action, (_state, { payload: { target } }) => {
      sendMessage(revokeModeratorRole({ target: target }));
    });
});

export default Control;
