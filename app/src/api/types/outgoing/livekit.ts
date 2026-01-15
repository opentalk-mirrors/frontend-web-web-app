// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { RootState } from '../../../store';
import { Namespaced, ParticipantId, createModule } from '../../../types';
import { createSignalingApiCall } from '../../createSignalingApiCall';
import { sendMessage } from './common';

export interface ForceMute {
  action: 'force_mute';
  participants?: Array<ParticipantId>;
}

export interface GrantScreenSharePermission {
  action: 'grant_screen_share_permission';
  participants: Array<ParticipantId>;
}

export interface RevokeScreenSharePermission {
  action: 'revoke_screen_share_permission';
  participants: Array<ParticipantId>;
}

export interface EnableMicrophoneRestrictions {
  action: 'enable_microphone_restrictions';
  unrestrictedParticipants: Array<ParticipantId>;
}

export interface DisableMicrophoneRestrictions {
  action: 'disable_microphone_restrictions';
}

export interface RequestPopoutStreamAccessToken {
  action: 'request_popout_stream_access_token';
}

export interface CreateNewAccessToken {
  action: 'create_new_access_token';
}

export type Action =
  | ForceMute
  | GrantScreenSharePermission
  | RevokeScreenSharePermission
  | EnableMicrophoneRestrictions
  | DisableMicrophoneRestrictions
  | RequestPopoutStreamAccessToken
  | CreateNewAccessToken;

export type Livekit = Namespaced<Action, 'livekit'>;

export const requestMute = createSignalingApiCall<ForceMute>('livekit', 'force_mute');
export const grantScreenSharePermission = createSignalingApiCall<GrantScreenSharePermission>(
  'livekit',
  'grant_screen_share_permission'
);
export const revokeScreenSharePermission = createSignalingApiCall<RevokeScreenSharePermission>(
  'livekit',
  'revoke_screen_share_permission'
);
export const enableMicrophoneRestrictions = createSignalingApiCall<EnableMicrophoneRestrictions>(
  'livekit',
  'enable_microphone_restrictions'
);
export const disableMicrophoneRestrictions = createSignalingApiCall<DisableMicrophoneRestrictions>(
  'livekit',
  'disable_microphone_restrictions'
);

export const requestPopoutStreamAccessToken = createSignalingApiCall<RequestPopoutStreamAccessToken>(
  'livekit',
  'request_popout_stream_access_token'
);

export const createNewAccessToken = createSignalingApiCall<CreateNewAccessToken>('livekit', 'create_new_access_token');

export const handler = createModule<RootState>((builder) => {
  builder.addCase(requestMute.action, (_state, action) => {
    sendMessage(requestMute(action.payload));
  });
  builder.addCase(grantScreenSharePermission.action, (_state, action) => {
    sendMessage(grantScreenSharePermission(action.payload));
  });
  builder.addCase(revokeScreenSharePermission.action, (_state, action) => {
    sendMessage(revokeScreenSharePermission(action.payload));
  });
  builder.addCase(enableMicrophoneRestrictions.action, (_state, action) => {
    sendMessage(enableMicrophoneRestrictions(action.payload));
  });
  builder.addCase(disableMicrophoneRestrictions.action, (_state, action) => {
    sendMessage(disableMicrophoneRestrictions(action.payload));
  });
  builder.addCase(requestPopoutStreamAccessToken.action, (_state, action) => {
    sendMessage(requestPopoutStreamAccessToken(action.payload));
  });
  builder.addCase(createNewAccessToken.action, (_state, action) => {
    sendMessage(createNewAccessToken(action.payload));
  });
});

export default Livekit;
