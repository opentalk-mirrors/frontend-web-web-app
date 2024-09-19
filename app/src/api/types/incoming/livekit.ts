// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { NamespacedIncoming, ParticipantId } from '../../../types';

export interface LivekitError {
  message: 'error';
  error: 'livekit_unavailable';
}

export interface MicrophoneRestrictionsEnabled {
  message: 'microphone_restrictions_enabled';
  unrestrictedParticipants: Array<ParticipantId>;
}

export interface MicrophoneRestrictionsDisabled {
  message: 'microphone_restrictions_disabled';
}

export type Message = MicrophoneRestrictionsEnabled | MicrophoneRestrictionsDisabled | LivekitError;

export type Livekit = NamespacedIncoming<Message, 'livekit'>;

export default Livekit;
