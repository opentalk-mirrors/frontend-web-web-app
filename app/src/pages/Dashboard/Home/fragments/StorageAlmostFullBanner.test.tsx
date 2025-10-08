// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Mock } from 'vitest';

import { useGetMeQuery, useGetMeTariffQuery } from '../../../../api/rest';
import { configureStore, renderWithProviders } from '../../../../utils/testUtils';
import { StorageAlmostFullBanner } from './StorageAlmostFullBanner';
import { STORAGE_SECTION_PATH, CRITICAL_STORAGE_CAPACITY_IN_PERCENT } from './constants';

const MAX_LIMITED_STORAGE_IN_MB = 100;
const CRITICAL_USED_STORAGE_IN_MB = (MAX_LIMITED_STORAGE_IN_MB * CRITICAL_STORAGE_CAPACITY_IN_PERCENT) / 100;

vi.mock('../../../../api/rest', async (importOriginal) => ({
  ...(await importOriginal()),
  useGetMeQuery: vi.fn(),
  useGetMeTariffQuery: vi.fn(),
}));

const mockUseGetMeQuery = useGetMeQuery as Mock;
const mockUseGetMeTariffQuery = useGetMeTariffQuery as Mock;

const ACCOUNT_MANAGEMENT_URL = 'account.management.url';
const { store } = configureStore({
  initialState: {
    config: { provider: { accountManagementUrl: ACCOUNT_MANAGEMENT_URL } },
  },
});

describe('Storage almost full Banner', () => {
  it('shows nothing for unlimited storage', () => {
    mockUseGetMeQuery.mockImplementation(() => ({
      data: {
        usedStorage: MAX_LIMITED_STORAGE_IN_MB * 1000 * 1000,
      },
    }));
    mockUseGetMeTariffQuery.mockImplementation(() => ({
      data: {
        quotas: {
          maxStorage: undefined,
        },
        modules: {},
      },
    }));

    renderWithProviders(<StorageAlmostFullBanner />, { store });
    expect(screen.queryByText(/./)).not.toBeInTheDocument();
  });

  it('shows nothing for used storage beyond critical', () => {
    mockUseGetMeQuery.mockImplementation(() => ({
      data: {
        usedStorage: CRITICAL_USED_STORAGE_IN_MB * 1000 * 1000 - 1,
      },
    }));
    mockUseGetMeTariffQuery.mockImplementation(() => ({
      data: {
        quotas: {
          maxStorage: MAX_LIMITED_STORAGE_IN_MB * 1000 * 1000,
        },
        modules: {},
      },
    }));

    renderWithProviders(<StorageAlmostFullBanner />, { store });
    expect(screen.queryByText(/./)).not.toBeInTheDocument();
  });

  it('renders payment banner for critical used storage and buttons functionality', async () => {
    mockUseGetMeQuery.mockImplementation(() => ({
      data: {
        usedStorage: CRITICAL_USED_STORAGE_IN_MB * 1000 * 1000,
      },
    }));
    mockUseGetMeTariffQuery.mockImplementation(() => ({
      data: {
        quotas: {
          maxStorage: MAX_LIMITED_STORAGE_IN_MB * 1000 * 1000,
        },
        modules: {
          core: {
            features: ['storage_upgradable'],
          },
        },
      },
    }));

    renderWithProviders(<StorageAlmostFullBanner />, { store, provider: { mui: true, router: true } });
    expect(screen.getByText('dashboard-storage-almost-full-message')).toBeInTheDocument();

    // Test navigation to account management url
    // mock window.open
    const jsdomOpen = window.open;
    window.open = vi.fn();

    const upgradeButton = screen.getByRole('button', { name: 'global-upgrade' });
    await userEvent.click(upgradeButton);
    expect(window.open).toHaveBeenCalledExactlyOnceWith(ACCOUNT_MANAGEMENT_URL, '_self');

    // restore window.open
    window.open = jsdomOpen;

    // Test link to the storage section
    const storageLink = screen.getByRole('link', { name: 'dashboard-settings-storage' });
    expect(storageLink).toHaveAttribute('href', STORAGE_SECTION_PATH);
  });
  it('does not render upgrade button when storage is not upgradable', async () => {
    mockUseGetMeQuery.mockImplementation(() => ({
      data: {
        usedStorage: CRITICAL_USED_STORAGE_IN_MB * 1000 * 1000,
      },
    }));
    mockUseGetMeTariffQuery.mockImplementation(() => ({
      data: {
        quotas: {
          maxStorage: MAX_LIMITED_STORAGE_IN_MB * 1000 * 1000,
        },
        modules: {
          core: {
            features: [],
          },
        },
      },
    }));

    renderWithProviders(<StorageAlmostFullBanner />, { store, provider: { mui: true, router: true } });

    const upgradeButton = screen.queryByRole('button', { name: 'global-upgrade' });
    expect(upgradeButton).not.toBeInTheDocument();
  });
});
