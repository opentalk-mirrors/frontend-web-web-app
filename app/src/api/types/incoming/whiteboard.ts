// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { AssetId } from '@opentalk/rest-api-rtk-query';

import { ErrorStruct, NamespacedIncoming } from '../../../types';

export interface InitializationStarted {
  message: 'initialization_started';
}

export interface Initialized {
  message: 'initialized';
  url: string;
}

export interface AssetRef {
  assetId: AssetId;
  filename: string;
}

export interface PdfUrl extends AssetRef {
  message: 'pdf_asset';
}

export interface PdfCreated extends AssetRef {
  message: 'pdf_created';
}

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

export type Message = InitializationStarted | Initialized | PdfCreated | ErrorStruct<WhiteboardError>;

export type Whiteboard = NamespacedIncoming<Message, 'whiteboard'>;

export default Whiteboard;
