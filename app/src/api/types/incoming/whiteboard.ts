// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { AssetId } from '@opentalk/rest-api-rtk-query';

import { ErrorStruct, NamespacedIncoming } from '../../../types';

export interface SpaceUrl {
  message: 'space_url';
  url: string;
}

export interface AssetRef {
  assetId: AssetId;
  filename: string;
}

export interface PdfUrl extends AssetRef {
  message: 'pdf_asset';
}
export enum WhiteboardError {
  InsufficientPermissions = 'insufficient_permissions',
  StorageExceeded = 'storage_exceeded',
  GenerateFailed = 'generate_failed',
  AlreadyInitialized = 'already_initialized',
  CurrentlyInitializing = 'currently_initializing',
}

export type Message = SpaceUrl | PdfUrl | ErrorStruct<WhiteboardError>;

export type Whiteboard = NamespacedIncoming<Message, 'whiteboard'>;

export default Whiteboard;
