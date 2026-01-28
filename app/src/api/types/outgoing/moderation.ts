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

export interface UnbanParticipant {
  action: 'unban';
  target: ParticipantId;
}

export interface UpdateRole {
  action: 'update_role';
  participantId: ParticipantId;
  newRole: Role;
}

export interface Debrief {
  action: 'debrief';
  kickScope: KickScope;
}

export interface EnableWaitingRoom {
  action: 'enable_waiting_room';
}

export interface DisableWaitingRoom {
  action: 'disable_waiting_room';
}

export interface SendParticipantToWaitingRoom {
  action: 'send_to_waiting_room';
  target: ParticipantId;
}

export interface ChangeDisplayName {
  action: 'change_display_name';
  target: ParticipantId;
  newName: string;
}

export interface DisableDisplayNameChangeRestrictions {
  action: 'disable_display_name_change_restrictions';
}

export interface EnableDisplayNameChangeRestrictions {
  action: 'enable_display_name_change_restrictions';
  unrestrictedParticipants: Array<ParticipantId>;
}

export interface AcceptParticipantFromWaitingRoomToRoom {
  action: 'accept';
  target: ParticipantId;
}

export interface Mute {
  action: 'mute';
  participants?: Array<ParticipantId>;
}

export interface EnableMicrophoneRestrictions {
  action: 'enable_microphone_restrictions';
  unrestrictedParticipants: Array<ParticipantId>;
}

export interface DisableMicrophoneRestrictions {
  action: 'disable_microphone_restrictions';
}

export type Action =
  | KickParticipant
  | BanParticipant
  | UnbanParticipant
  | SendParticipantToWaitingRoom
  | EnableWaitingRoom
  | DisableWaitingRoom
  | AcceptParticipantFromWaitingRoomToRoom
  | Debrief
  | ChangeDisplayName
  | DisableDisplayNameChangeRestrictions
  | EnableDisplayNameChangeRestrictions
  | UpdateRole
  | Mute
  | EnableMicrophoneRestrictions
  | DisableMicrophoneRestrictions;

export type Moderation = Namespaced<Action, 'moderation'>;

export const kickParticipant = createSignalingApiCall<KickParticipant>('moderation', 'kick');
export const banParticipant = createSignalingApiCall<BanParticipant>('moderation', 'ban');
export const unbanParticipant = createSignalingApiCall<UnbanParticipant>('moderation', 'unban');
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
export const enableMicrophoneRestrictions = createSignalingApiCall<EnableMicrophoneRestrictions>(
  'moderation',
  'enable_microphone_restrictions'
);
export const disableMicrophoneRestrictions = createSignalingApiCall<DisableMicrophoneRestrictions>(
  'moderation',
  'disable_microphone_restrictions'
);
export const disableDisplayNameChangeRestrictions = createSignalingApiCall<DisableDisplayNameChangeRestrictions>(
  'moderation',
  'disable_display_name_change_restrictions'
);
export const enableDisplayNameChangeRestrictions = createSignalingApiCall<EnableDisplayNameChangeRestrictions>(
  'moderation',
  'enable_display_name_change_restrictions'
);

export const handler = createModule<RootState>((builder) => {
  builder
    .addCase(kickParticipant.action, (_state, action) => {
      sendMessage(kickParticipant(action.payload));
    })
    .addCase(banParticipant.action, (_state, action) => {
      sendMessage(banParticipant(action.payload));
    })
    .addCase(unbanParticipant.action, (_state, action) => {
      sendMessage(unbanParticipant(action.payload));
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
    .addCase(disableDisplayNameChangeRestrictions.action, () => {
      sendMessage(disableDisplayNameChangeRestrictions());
    })
    .addCase(enableDisplayNameChangeRestrictions.action, (_state, action) => {
      sendMessage(enableDisplayNameChangeRestrictions(action.payload));
    })
    .addCase(mute.action, (_state, action) => {
      sendMessage(mute(action.payload));
    })
    .addCase(updateRole.action, (_state, action) => {
      sendMessage(updateRole(action.payload));
    })
    .addCase(enableMicrophoneRestrictions.action, (_state, action) => {
      sendMessage(enableMicrophoneRestrictions(action.payload));
    })
    .addCase(disableMicrophoneRestrictions.action, (_state, action) => {
      sendMessage(disableMicrophoneRestrictions(action.payload));
    });
});

export default Moderation;
