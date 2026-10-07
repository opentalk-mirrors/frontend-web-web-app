// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { SceneBounds } from '@excalidraw/excalidraw/element/bounds';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import type { ExcalidrawImperativeAPI, ExcalidrawProps } from '@excalidraw/excalidraw/types';
import { AssetId } from '@opentalk/rest-api-rtk-query';

import type { ErrorStruct, NamespacedIncoming, ParticipantId } from '../../../types';

export type ExcalidrawVolatileData = Parameters<NonNullable<ExcalidrawProps['onPointerUpdate']>>[0];
export type ExcalidrawElements = readonly ExcalidrawElement[];
type ExcalidrawAppState = ReturnType<ExcalidrawImperativeAPI['getAppState']>;
export type ExcalidrawScene = {
  elements: ExcalidrawElements;
};

export interface AssetRef {
  assetId: AssetId;
  filename: string;
}

export type WhiteboardScene = {
  appState?: Partial<ExcalidrawAppState>;
} & Pick<ExcalidrawScene, 'elements'>;

export type WhiteboardEditRestrictions = {
  enabled?: boolean;
  unrestrictedParticipants?: ParticipantId[];
};

type Started = {
  message: 'started';
  initialScene: WhiteboardScene;
  editRestrictions: WhiteboardEditRestrictions;
};

type Stopped = {
  message: 'stopped';
};

export type VolatileBroadcast = {
  message: 'volatile_broadcast';
  sender: ParticipantId;
  data: ExcalidrawVolatileData | { sceneBounds: SceneBounds };
};

type Broadcast = {
  message: 'broadcast';
  sender: ParticipantId;
  data: Pick<ExcalidrawScene, 'elements'>;
};

type SceneStored = {
  message: 'scene_stored';
  scene: ExcalidrawScene;
};

type FollowerGained = {
  message: 'follower_gained';
  participantId: ParticipantId;
};

type Followed = {
  message: 'followed';
  participantId: ParticipantId;
};

type FollowerLost = {
  message: 'follower_lost';
  participantId: ParticipantId;
};

type Unfollowed = {
  message: 'unfollowed';
  participantId: ParticipantId;
};

type EditRestrictionsEnabled = {
  message: 'edit_restrictions_enabled';
  unrestrictedParticipants: ParticipantId[];
};

type EditRestrictionsDisabled = {
  message: 'edit_restrictions_disabled';
};

export enum WhiteboardError {
  /// The requesting user has insufficient permissions for the operation.
  InsufficientPermissions = 'insufficient_permissions',
  /// Spacedeck has not been initialized yet.
  NotInitialized = 'not_initialized',
  /// Spacedeck is already initializing.
  CurrentlyInitializing = 'currently_initializing',
  /// The spacedeck initialization failed.
  InitializationFailed = 'initialization_failed',
  /// Spacedeck is already initialized.
  AlreadyInitialized = 'already_initialized',
  /// The requesting user has exceeded their storage.
  StorageExceeded = 'storage_exceeded',
  /// An internal error occurred while saving the whiteboard pdf.
  InternalStorage = 'internal_storage',
  ///
  GenerateFailed = 'generate_failed',
}

type SpacedeckInitialized = {
  message: 'initialized';
  url: string;
};

interface SpacedeckPdfCreated extends AssetRef {
  message: 'pdf_created';
}

export type ExcalidrawMessage =
  | Started
  | Stopped
  | VolatileBroadcast
  | Broadcast
  | SceneStored
  | FollowerGained
  | Followed
  | FollowerLost
  | Unfollowed
  | EditRestrictionsEnabled
  | EditRestrictionsDisabled
  | ErrorStruct<WhiteboardError>;

export type SpacedeckMessage = SpacedeckInitialized | SpacedeckPdfCreated | ErrorStruct<WhiteboardError>;

type ExcalidrawWhiteboard = NamespacedIncoming<ExcalidrawMessage, 'excalidraw'>;
type SpacedeckWhiteboard = NamespacedIncoming<SpacedeckMessage, 'whiteboard'>;
type WhiteboardMessage = ExcalidrawWhiteboard | SpacedeckWhiteboard;

export default WhiteboardMessage;
