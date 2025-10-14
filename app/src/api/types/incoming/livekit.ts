// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { NamespacedIncoming } from '../../../types';

export interface LivekitError {
  message: 'error';
  error: 'livekit_unavailable';
}

export interface PopoutStreamAccessToken {
  message: 'popout_stream_access_token';
  token: string;
}

export interface Credentials {
  message: 'credentials';
  room: string;
  token: string;
  publicUrl: string;
}

export type Message = PopoutStreamAccessToken | Credentials | LivekitError;

export type Livekit = NamespacedIncoming<Message, 'livekit'>;

export default Livekit;
