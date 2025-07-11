// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { RootState } from '../../../store';
import { createModule, KickScope, Namespaced, ParticipantId, Role } from '../../../types';
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

export interface Debrief {
  action: 'debrief';
  kickScope: KickScope;
}

export interface ChangeDisplayName {
  action: 'change_display_name';
  target: ParticipantId;
  newName: string;
}

export interface Mute {
  action: 'mute';
  participants?: Array<ParticipantId>;
}

export interface UpdateRole {
  action: 'update_role';
  participantId: ParticipantId;
  newRole: Role;
}

export type Action =
  | KickParticipant
  | BanParticipant
  | SendParticipantToWaitingRoom
  | EnableWaitingRoom
  | DisableWaitingRoom
  | AcceptParticipantFromWaitingRoomToRoom
  | Debrief
  | ChangeDisplayName
  | UpdateRole
  | Mute;

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
export const debrief = createSignalingApiCall<Debrief>('moderation', 'debrief');
export const changeDisplayName = createSignalingApiCall<ChangeDisplayName>('moderation', 'change_display_name');
export const mute = createSignalingApiCall<Mute>('moderation', 'mute');
export const updateRole = createSignalingApiCall<UpdateRole>('moderation', 'update_role');

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
    .addCase(debrief.action, (_state, action) => {
      sendMessage(debrief(action.payload));
    })
    .addCase(changeDisplayName.action, (_state, action) => {
      sendMessage(changeDisplayName(action.payload));
    })
    .addCase(mute.action, (_state, action) => {
      sendMessage(mute(action.payload));
    })
    .addCase(updateRole.action, (_state, action) => {
      sendMessage(updateRole(action.payload));
    });
});

export default Moderation;
