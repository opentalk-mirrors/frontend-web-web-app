// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { StreamingTargetId } from '@opentalk/rest-api-rtk-query';

import type { RootState } from '../../../store';
import { createModule, Namespaced } from '../../../types';
import { createSignalingApiCall } from '../../createSignalingApiCall';
import { sendMessage } from './common';

interface BaseTargets {
  targetIds: Array<StreamingTargetId>;
}

export interface StartStream extends BaseTargets {
  action: 'start_stream';
}
export interface StopStream extends BaseTargets {
  action: 'stop_stream';
}
export interface PauseStream extends BaseTargets {
  action: 'pause_stream';
}
export interface SetStreamConsent {
  action: 'set_consent';
  consent: boolean;
}

export type Action = StartStream | StopStream | PauseStream | SetStreamConsent;

export type Streaming = Namespaced<Action, 'recording'>;

export const sendStartStreamSignal = createSignalingApiCall<StartStream>('recording', 'start_stream');
export const sendStopStreamSignal = createSignalingApiCall<StopStream>('recording', 'stop_stream');
export const sendPauseStreamSignal = createSignalingApiCall<PauseStream>('recording', 'pause_stream');
export const sendStreamConsentSignal = createSignalingApiCall<SetStreamConsent>('recording', 'set_consent');

export const handler = createModule<RootState>((builder) => {
  builder
    .addCase(sendStartStreamSignal.action, (_state, action) => {
      sendMessage(sendStartStreamSignal(action.payload));
    })
    .addCase(sendStopStreamSignal.action, (_state, action) => {
      sendMessage(sendStopStreamSignal(action.payload));
    })
    .addCase(sendPauseStreamSignal.action, (_state, action) => {
      sendMessage(sendPauseStreamSignal(action.payload));
    })
    .addCase(sendStreamConsentSignal.action, (_state, action) => {
      sendMessage(sendStreamConsentSignal(action.payload));
    });
});

export default Streaming;
