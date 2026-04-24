// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { RecordingStatus, StreamingTargetId, StreamStatus } from '@opentalk/rest-api-rtk-query';

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

export interface StartRecording {
  action: 'start_recording';
}

export interface PauseRecording {
  action: 'pause_recording';
}

export interface StopRecording {
  action: 'stop_recording';
}

export interface Service {
  action: 'service';
  command: RecordingServiceEvent;
}

export type RecordingServiceEvent = RecordingUpdated | StreamUpdated;

interface RecordingUpdated {
  kind: 'recording_updated';
  status: RecordingStatus;
}

interface StreamUpdated {
  kind: 'stream_updated';
  targetId: StreamingTargetId;
  status: StreamStatus;
}

export type Action =
  | StartRecording
  | PauseRecording
  | StopRecording
  | StartStream
  | StopStream
  | PauseStream
  | SetStreamConsent
  | Service;

export type Streaming = Namespaced<Action, 'recording'>;

export const sendStartStreamSignal = createSignalingApiCall<StartStream>('recording', 'start_stream');
export const sendStopStreamSignal = createSignalingApiCall<StopStream>('recording', 'stop_stream');
export const sendPauseStreamSignal = createSignalingApiCall<PauseStream>('recording', 'pause_stream');
export const sendStreamConsentSignal = createSignalingApiCall<SetStreamConsent>('recording', 'set_consent');
export const sendStartRecordingSignal = createSignalingApiCall<StartRecording>('recording', 'start_recording');
export const sendPauseRecordingSignal = createSignalingApiCall<PauseRecording>('recording', 'pause_recording');
export const sendStopRecordingSignal = createSignalingApiCall<StopRecording>('recording', 'stop_recording');
export const sendRecordingServiceCommandSignal = createSignalingApiCall<Service>('recording', 'service');

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
    .addCase(sendPauseRecordingSignal.action, (_state, action) => {
      sendMessage(sendPauseRecordingSignal(action.payload));
    })
    .addCase(sendStartRecordingSignal.action, (_state, action) => {
      sendMessage(sendStartRecordingSignal(action.payload));
    })
    .addCase(sendStopRecordingSignal.action, (_state, action) => {
      sendMessage(sendStopRecordingSignal(action.payload));
    })
    .addCase(sendStreamConsentSignal.action, (_state, action) => {
      sendMessage(sendStreamConsentSignal(action.payload));
    })
    .addCase(sendRecordingServiceCommandSignal.action, (_state, action) => {
      sendMessage(sendRecordingServiceCommandSignal(action.payload));
    });
});

export default Streaming;
