// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SceneBounds } from '@excalidraw/excalidraw/element/bounds';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import type { ExcalidrawImperativeAPI, ExcalidrawProps } from '@excalidraw/excalidraw/types';
import { AssetId } from '@opentalk/rest-api-rtk-query';

import type { ErrorStruct, NamespacedIncoming, ParticipantId } from '../../../types';

export type ExcalidrawVolatileData = Parameters<NonNullable<ExcalidrawProps['onPointerUpdate']>>[0];
export type ExcalidrawElements = readonly ExcalidrawElement[];
export type ExcalidrawAppState = ReturnType<ExcalidrawImperativeAPI['getAppState']>;
export type ExcalidrawScene = {
  elements: ExcalidrawElements;
  appState: ExcalidrawAppState;
};

export type Token = string;

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

export type Started = {
  message: 'started';
  initialScene: WhiteboardScene;
  editRestrictions: WhiteboardEditRestrictions;
};

export type VolatileBroadcast = {
  message: 'volatile_broadcast';
  sender: ParticipantId;
  data: ExcalidrawVolatileData | { sceneBounds: SceneBounds };
};

export type Broadcast = {
  message: 'broadcast';
  sender: ParticipantId;
  data: Pick<ExcalidrawScene, 'elements'>;
};

export type SceneStored = {
  message: 'scene_stored';
  scene: ExcalidrawScene;
};

export type FollowerGained = {
  message: 'follower_gained';
  participantId: ParticipantId;
};

export type Followed = {
  message: 'followed';
  participantId: ParticipantId;
};

export type FollowerLost = {
  message: 'follower_lost';
  participantId: ParticipantId;
};

export type Unfollowed = {
  message: 'unfollowed';
  participantId: ParticipantId;
};

export type EditRestrictionsEnabled = {
  message: 'edit_restrictions_enabled';
  unrestrictedParticipants: ParticipantId[];
};

export type EditRestrictionsDisabled = {
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

export interface SpacedeckPdfUrl extends AssetRef {
  message: 'pdf_asset';
}

export interface SpacedeckPdfCreated extends AssetRef {
  message: 'pdf_created';
}

export type ExcalidrawMessage =
  | Started
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

export type ExcalidrawWhiteboard = NamespacedIncoming<ExcalidrawMessage, 'excalidraw'>;
export type SpacedeckWhiteboard = NamespacedIncoming<SpacedeckMessage, 'whiteboard'>;
export type WhiteboardMessage = ExcalidrawWhiteboard | SpacedeckWhiteboard;

export default WhiteboardMessage;
