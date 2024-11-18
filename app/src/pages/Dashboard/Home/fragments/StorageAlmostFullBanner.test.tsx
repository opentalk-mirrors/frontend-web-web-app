// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import userEvent from '@testing-library/user-event';

import { useGetMeQuery, useGetMeTariffQuery } from '../../../../api/rest';
import { configureStore, render, screen } from '../../../../utils/testUtils';
import { StorageAlmostFullBanner } from './StorageAlmostFullBanner';
import { STORAGE_SECTION_PATH, CRITICAL_STORAGE_CAPACITY_IN_PERCENT } from './constants';

const MAX_LIMITED_STORAGE_IN_MB = 100;
const CRITICAL_USED_STORAGE_IN_MB = (MAX_LIMITED_STORAGE_IN_MB * CRITICAL_STORAGE_CAPACITY_IN_PERCENT) / 100;

jest.mock('../../../../api/rest', () => ({
  ...jest.requireActual('../../../../api/rest'),
  useGetMeQuery: jest.fn(),
  useGetMeTariffQuery: jest.fn(),
}));

const mockUseGetMeQuery = useGetMeQuery as jest.Mock;
const mockUseGetMeTariffQuery = useGetMeTariffQuery as jest.Mock;

const ACCOUNT_MANAGEMENT_URL = 'account.management.url';
const { store } = configureStore({
  initialState: {
    config: { provider: { accountManagementUrl: ACCOUNT_MANAGEMENT_URL } },
  },
});

describe('Storage almost full Banner', () => {
  test('shows nothing for unlimited storage', async () => {
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
      },
    }));

    await render(<StorageAlmostFullBanner />, store);
    expect(screen.queryByText(/./)).not.toBeInTheDocument();
  });

  test('shows nothing for used storage beyond critical', async () => {
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
      },
    }));

    await render(<StorageAlmostFullBanner />, store);
    expect(screen.queryByText(/./)).not.toBeInTheDocument();
  });

  test('renders payment banner for critical used storage and buttons functionality', async () => {
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
      },
    }));

    await render(<StorageAlmostFullBanner />, store);
    expect(screen.getByText('dashboard-storage-almost-full-message')).toBeInTheDocument();

    // Test navigation to accounte mangement url
    // mock window.open
    const jsdomOpen = window.open;
    window.open = jest.fn();

    const upgradeButton = screen.getByRole('button', { name: 'global-upgrade' });
    await userEvent.click(upgradeButton);
    expect(window.open).toHaveBeenCalledWith(ACCOUNT_MANAGEMENT_URL, '_self');

    // restore window.open
    window.open = jsdomOpen;

    // Test link to the storage section
    const storageLink = screen.getByRole('link', { name: 'dashboard-settings-storage' });
    expect(storageLink).toHaveAttribute('href', STORAGE_SECTION_PATH);
  });
});
