// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { BackendModules, CoreFeatures } from '@opentalk/rest-api-rtk-query';

import { configureStore, renderHookWithProviders } from '../utils/testUtils';
import { useStorageStatus } from './useStorageStatus';

type StorageState = {
  used?: number;
  total?: number;
  canUpgrade?: boolean;
};

const renderUseStorageStatus = ({ used, total, canUpgrade = false }: StorageState = {}) => {
  const { store } = configureStore({
    initialState: {
      config: {
        enabledModules: canUpgrade ? { [BackendModules.Core]: [CoreFeatures.StorageUpgradable] } : {},
        tariff: {
          id: '',
          name: '',
          quotas: total === undefined ? {} : { maxStorage: total },
          usedQuota: used === undefined ? {} : { maxStorage: used },
          disabledFeatures: [],
        },
      },
    },
  });

  return renderHookWithProviders(() => useStorageStatus(), { store });
};

describe('useStorageStatus', () => {
  it('returns ok with zero usage when storage has no total quota', () => {
    const { result } = renderUseStorageStatus({ used: 42 });

    expect(result.current).toEqual({
      usagePercentage: 0,
      storageStatus: 'ok',
      canUpgrade: false,
    });
  });

  it('defaults missing used storage to zero', () => {
    const { result } = renderUseStorageStatus({ total: 100 });

    expect(result.current).toEqual({
      usagePercentage: 0,
      storageStatus: 'ok',
      canUpgrade: false,
    });
  });

  it('returns ok when storage usage is below the near-limit threshold', () => {
    const { result } = renderUseStorageStatus({ used: 94, total: 100 });

    expect(result.current.storageStatus).toBe('ok');
    expect(result.current.usagePercentage).toBe(94);
  });

  it('returns near_limit when storage usage reaches 95 percent', () => {
    const { result } = renderUseStorageStatus({ used: 95, total: 100 });

    expect(result.current.storageStatus).toBe('near_limit');
    expect(result.current.usagePercentage).toBe(95);
  });

  it('returns full when storage usage reaches or exceeds total capacity', () => {
    const { result } = renderUseStorageStatus({ used: 101, total: 100 });

    expect(result.current.storageStatus).toBe('full');
    expect(result.current.usagePercentage).toBe(101);
  });

  it('returns whether storage upgrades are enabled', () => {
    const { result } = renderUseStorageStatus({ used: 1, total: 100, canUpgrade: true });

    expect(result.current.canUpgrade).toBe(true);
  });
});
