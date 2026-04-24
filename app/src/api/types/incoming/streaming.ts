// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { RecordingStatusInfo, StreamStatusInfo, StreamingTargetId } from '@opentalk/rest-api-rtk-query';

import { ErrorStruct, NamespacedIncoming, ParticipantId } from '../../../types';

export type RecordingUpdated = {
  message: 'recording_updated';
} & RecordingStatusInfo;

export type StreamUpdated = {
  message: 'stream_updated';
  targetId: StreamingTargetId;
} & StreamStatusInfo;

export interface ConsentUpdated {
  message: 'consent_updated';
  participantId: ParticipantId;
  consents: boolean;
}

export interface Service {
  message: 'service';
  event: RecordingServiceCommand;
}

export type RecordingServiceCommand =
  | { type: 'StartRecording' }
  | { type: 'PauseRecording' }
  | { type: 'StopRecording' }
  | {
      type: 'StartStreams';
      target_ids: StreamingTargetId[];
    }
  | {
      type: 'PauseStreams';
      target_ids: StreamingTargetId[];
    }
  | {
      type: 'StopStreams';
      target_ids: StreamingTargetId[];
    };

export enum RecordingError {
  /// The recording feature is not available in this room
  RecordFeatureDisabled = 'record_feature_disabled',
  /// The streaming feature is not available in this room
  StreamFeatureDisabled = 'stream_feature_disabled',
  /// The participant has insufficient permissions to perform a command
  InsufficientPermissions = 'insufficient_permissions',
  /// Invalid streaming id used
  InvalidStreamingId = 'invalid_streaming_id',
  /// Streaming target already in use
  StreamingTargetInUse = 'streaming_target_in_use',
  /// Recorder is not started
  RecorderNotStarted = 'recorder_not_started',
  /// Tried to start a recording for a room that has one already active
  RecordingAlreadyActive = 'recording_already_active',
  /// Tried to pause or stop a recording, but it isn't active
  RecordingNotActive = 'recording_not_active',
  /// Failed to request a recording service for this room
  FailedToRequestRecordingService = 'failed_to_request_recording_service',
}

export type Message = RecordingUpdated | StreamUpdated | ConsentUpdated | Service | ErrorStruct<RecordingError>;

export type Streaming = NamespacedIncoming<Message, 'recording'>;

export default Streaming;
