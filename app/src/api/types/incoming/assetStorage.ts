// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { NamespacedIncoming } from '../../../types';

type IncomingStorageUsageUpdate = {
  message: 'storage_usage_update';
  usedStorage: number;
};

type IncomingAssetStorage = IncomingStorageUsageUpdate;

export type AssetStorage = NamespacedIncoming<IncomingAssetStorage, 'asset_storage'>;
export default AssetStorage;
