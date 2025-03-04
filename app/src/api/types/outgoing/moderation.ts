// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { RootState } from '../../../store';
import { createModule, KickScope, Namespaced, ParticipantId } from '../../../types';
import { createSignalingApiCall } from '../../createSignalingApiCall';
import { sendMessage } from './common';

export interface KickParticipant {
  action: 'kick';
  target: ParticipantId;
}
export interface BanParticipant {
  action: 'ban';
  target: ParticipantId;
}
export interface SendParticipantToWaitingRoom {
  action: 'send_to_waiting_room';
  target: ParticipantId;
}
export interface EnableWaitingRoom {
  action: 'enable_waiting_room';
}

export interface DisableWaitingRoom {
  action: 'disable_waiting_room';
}

export interface AcceptParticipantFromWaitingRoomToRoom {
  action: 'accept';
  target: ParticipantId;
}
export interface EnableRaiseHands {
  action: 'enable_raise_hands';
}

export interface DisableRaiseHands {
  action: 'disable_raise_hands';
}

export interface ResetRaisedHands {
  action: 'reset_raised_hands';
  target?: Array<ParticipantId>;
}

export interface Debrief {
  action: 'debrief';
  kickScope: KickScope;
}

export interface ChangeDisplayName {
  action: 'change_display_name';
  target: ParticipantId;
  newName: string;
}

export type Action =
  | KickParticipant
  | BanParticipant
  | SendParticipantToWaitingRoom
  | EnableWaitingRoom
  | DisableWaitingRoom
  | AcceptParticipantFromWaitingRoomToRoom
  | ResetRaisedHands
  | EnableRaiseHands
  | DisableRaiseHands
  | Debrief
  | ChangeDisplayName;

export type Moderation = Namespaced<Action, 'moderation'>;

export const kickParticipant = createSignalingApiCall<KickParticipant>('moderation', 'kick');
export const banParticipant = createSignalingApiCall<BanParticipant>('moderation', 'ban');
export const sendParticipantToWaitingRoom = createSignalingApiCall<SendParticipantToWaitingRoom>(
  'moderation',
  'send_to_waiting_room'
);
export const enableWaitingRoom = createSignalingApiCall<EnableWaitingRoom>('moderation', 'enable_waiting_room');
export const disableWaitingRoom = createSignalingApiCall<DisableWaitingRoom>('moderation', 'disable_waiting_room');
export const acceptParticipantFromWaitingRoomToRoom = createSignalingApiCall<AcceptParticipantFromWaitingRoomToRoom>(
  'moderation',
  'accept'
);
export const resetRaisedHands = createSignalingApiCall<ResetRaisedHands>('moderation', 'reset_raised_hands');
export const enableRaiseHands = createSignalingApiCall<EnableRaiseHands>('moderation', 'enable_raise_hands');
export const disableRaiseHands = createSignalingApiCall<DisableRaiseHands>('moderation', 'disable_raise_hands');
export const debrief = createSignalingApiCall<Debrief>('moderation', 'debrief');
export const changeDisplayName = createSignalingApiCall<ChangeDisplayName>('moderation', 'change_display_name');

export const handler = createModule<RootState>((builder) => {
  builder
    .addCase(kickParticipant.action, (_state, action) => {
      sendMessage(kickParticipant(action.payload));
    })
    .addCase(banParticipant.action, (_state, action) => {
      sendMessage(banParticipant(action.payload));
    })
    .addCase(sendParticipantToWaitingRoom.action, (_state, action) => {
      sendMessage(sendParticipantToWaitingRoom(action.payload));
    })
    .addCase(enableWaitingRoom.action, () => {
      sendMessage(enableWaitingRoom());
    })
    .addCase(disableWaitingRoom.action, () => {
      sendMessage(disableWaitingRoom());
    })
    .addCase(acceptParticipantFromWaitingRoomToRoom.action, (_state, action) => {
      sendMessage(acceptParticipantFromWaitingRoomToRoom(action.payload));
    })
    .addCase(resetRaisedHands.action, (_state, action) => {
      sendMessage(resetRaisedHands(action.payload));
    })
    .addCase(enableRaiseHands.action, () => {
      sendMessage(enableRaiseHands());
    })
    .addCase(disableRaiseHands.action, () => {
      sendMessage(disableRaiseHands());
    })
    .addCase(debrief.action, (_state, action) => {
      sendMessage(debrief(action.payload));
    })
    .addCase(changeDisplayName.action, (_state, action) => {
      sendMessage(changeDisplayName(action.payload));
    });
});

export default Moderation;
