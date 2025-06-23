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
export enum StreamingStatus {
  Active = 'active',
  Inactive = 'inactive',
  Paused = 'paused',
  Unavailable = 'unavailable',
  Error = 'error',
}

interface TargetStatus {
  status: StreamingStatus;
  targetId: StreamingTargetId;
}

interface StreamingTargetNonErrorStatus extends TargetStatus {
  status: Exclude<StreamingStatus, StreamingStatus.Error>;
}

interface ErrorReason {
  code: string;
  message: string;
}
interface StreamingTargetErrorStatus extends TargetStatus {
  status: StreamingStatus.Error;
  reason: ErrorReason;
}

export type StreamingTargetStatusInfo = StreamingTargetNonErrorStatus | StreamingTargetErrorStatus;

//Type used for the update message
export type StreamUpdatedMessage = StreamingTargetStatusInfo & {
  message: 'stream_updated';
};

export enum StreamingKind {
  Recording = 'recording',
  Livestream = 'livestream',
}
interface StreamingTargetKindBase {
  name: string;
  streamingKind: StreamingKind;
}
interface RecordingTargetKind extends StreamingTargetKindBase {
  streamingKind: StreamingKind.Recording;
}

interface StreamingTargetKind extends StreamingTargetKindBase {
  streamingKind: StreamingKind.Livestream;
  publicUrl: string;
}

type StreamingTargetKindInfo = RecordingTargetKind | StreamingTargetKind;

/**
 * Type of entity that is stored in streaming slice
 */
export type StreamingTargetEntity = StreamingTargetStatusInfo & StreamingTargetKindInfo;

//In the response Target ID is used as key and not in the object itself
type ReducedEntity = Exclude<StreamingTargetEntity, 'targetId'>;
type StreamingTargetHashMap = Record<StreamingTargetId, ReducedEntity>;

//Response from JoinSuccess
export interface StreamingState {
  clientType: 'participant';
  targets: StreamingTargetHashMap;
}
