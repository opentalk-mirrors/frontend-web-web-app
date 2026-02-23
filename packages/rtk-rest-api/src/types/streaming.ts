// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { RoomId } from './room';

export type StreamingTargetId = string & { readonly __tag: unique symbol };

export enum PlatformKind {
  Provider = 'provider',
  BuiltIn = 'builtin',
  Custom = 'custom',
}

type BasePlatform = {
  kind: PlatformKind;
};

type ExternalPlatformInfo = {
  streamingKey: string;
  publicUrl: string;
};

type ProviderPlatform = BasePlatform &
  ExternalPlatformInfo & {
    kind: PlatformKind.Provider;
    provider: string;
  };

type CustomPlatform = BasePlatform &
  ExternalPlatformInfo & {
    kind: PlatformKind.Custom;
    name: string;
    streamingEndpoint: URL;
  };

type BuiltInPlatform = BasePlatform & {
  kind: PlatformKind.BuiltIn;
};

export type StreamingTarget = ProviderPlatform | CustomPlatform | BuiltInPlatform;

interface BaseStreamingTargetInfo {
  id: StreamingTargetId;
  roomId: RoomId;
}

type CustomTargetInfo = CustomPlatform & BaseStreamingTargetInfo;

type BuiltInTargetInfo = BuiltInPlatform & BaseStreamingTargetInfo;

type ProviderTargetInfo = ProviderPlatform & BaseStreamingTargetInfo;

export type StreamingTargetInfo = CustomTargetInfo | BuiltInTargetInfo | ProviderTargetInfo;

//Shared types for streaming signaling

export enum RecordingStatus {
  Requested = 'requested',
  Active = 'active',
  Inactive = 'inactive',
  Paused = 'paused',
  Error = 'error',
}

export enum StreamStatus {
  InUse = 'in_use',
  Requested = 'requested',
  Inactive = 'inactive',
  Active = 'active',
  Paused = 'paused',
  Error = 'error',
}

export interface StreamErrorReason {
  code: string;
  message: string;
}

// Tagged union for RecordingStatus (matches backend #[serde(tag = "status")])
type RecordingStatusNonError = {
  status: Exclude<RecordingStatus, RecordingStatus.Error>;
};

type RecordingStatusError = {
  status: RecordingStatus.Error;
  reason: StreamErrorReason;
};

export type RecordingStatusInfo = RecordingStatusNonError | RecordingStatusError;

// Tagged union for StreamStatus (matches backend #[serde(tag = "status")])
type StreamStatusNonError = {
  status: Exclude<StreamStatus, StreamStatus.Error>;
};

type StreamStatusError = {
  status: StreamStatus.Error;
  reason: StreamErrorReason;
};

export type StreamStatusInfo = StreamStatusNonError | StreamStatusError;

// Status update for a streaming target (used in stream_updated event and slice actions)
export type StreamingTargetStatusInfo = {
  targetId: StreamingTargetId;
} & StreamStatusInfo;

// The stream_updated message type
export type StreamUpdatedMessage = StreamingTargetStatusInfo & {
  message: 'stream_updated';
};

export enum StreamingKind {
  Recording = 'recording',
  Livestream = 'livestream',
}

/**
 * Type of entity stored in the streaming slice.
 * Represents a streaming target from stream_states with an added targetId.
 */
export type StreamingTargetEntity = {
  targetId: StreamingTargetId;
  name: string;
  publicUrl: string;
} & StreamStatusInfo;
