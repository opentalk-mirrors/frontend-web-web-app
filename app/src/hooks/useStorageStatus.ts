// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { BackendModules, CoreFeatures } from '@opentalk/rest-api-rtk-query';

import { selectIsFeatureEnabled, selectStorageTotal, selectStorageUsed } from '../store/slices/configSlice';
import { useAppSelector } from './useCustomRedux';

export const useStorageStatus = () => {
  const used = useAppSelector(selectStorageUsed) ?? 0;
  const total = useAppSelector(selectStorageTotal);
  const canUpgrade = useAppSelector(selectIsFeatureEnabled(BackendModules.Core, CoreFeatures.StorageUpgradable));
  let storageStatus: 'ok' | 'near_limit' | 'full' = 'ok';

  const usagePercentage = total ? (used / total) * 100 : 0;

  if (total) {
    if (usagePercentage >= 100) {
      storageStatus = 'full';
    } else if (usagePercentage >= 95) {
      storageStatus = 'near_limit';
    }
  }

  return { usagePercentage, storageStatus, canUpgrade };
};
