// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { BackendModules, CoreFeatures } from '@opentalk/rest-api-rtk-query';

import { selectIsFeatureEnabled, selectStorageTotal, selectStorageUsed } from '../store/slices/configSlice';
import { useAppSelector } from './useCustomRedux';

export enum StorageStatus {
  Ok = 'ok',
  NearLimit = 'near_limit',
  Critical = 'critical',
  Full = 'full',
}

export type StorageStatusReturn = ReturnType<typeof useStorageStatus>;

export const useStorageStatus = () => {
  const used = useAppSelector(selectStorageUsed) ?? 0;
  const total = useAppSelector(selectStorageTotal);
  const canUpgrade = useAppSelector(selectIsFeatureEnabled(BackendModules.Core, CoreFeatures.StorageUpgradable));
  let storageStatus: StorageStatus = StorageStatus.Ok;

  const usagePercentage = total ? (used / total) * 100 : 0;

  if (total) {
    if (usagePercentage >= 100) {
      storageStatus = StorageStatus.Full;
    } else if (usagePercentage >= 99) {
      storageStatus = StorageStatus.Critical;
    } else if (usagePercentage >= 95) {
      storageStatus = StorageStatus.NearLimit;
    }
  }

  return { usagePercentage, storageStatus, canUpgrade };
};
