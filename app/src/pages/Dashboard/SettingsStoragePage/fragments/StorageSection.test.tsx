// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { useGetMeQuery, useGetMeTariffQuery } from '../../../../api/rest';
import { renderWithProviders, configureStore } from '../../../../utils/testUtils';
import { StorageSection } from './StorageSection';

const MAX_LIMITED_STORAGE_IN_MB = 100;
const USED_HALF_STORAGE_IN_MB = MAX_LIMITED_STORAGE_IN_MB / 2;

jest.mock('../../../../api/rest', () => ({
  ...jest.requireActual('../../../../api/rest'),
  useGetMeQuery: jest.fn(),
  useGetMeTariffQuery: jest.fn(),
}));

const mockUseGetMeQuery = useGetMeQuery as jest.Mock;
const mockUseGetMeTariffQuery = useGetMeTariffQuery as jest.Mock;

describe('Storage Section', () => {
  test('renders storage section for limited max storage and used half capacity', () => {
    const { store } = configureStore();
    mockUseGetMeQuery.mockImplementation(() => ({
      data: {
        usedStorage: USED_HALF_STORAGE_IN_MB * 1000 * 1000,
      },
    }));
    mockUseGetMeTariffQuery.mockImplementation(() => ({
      data: {
        quotas: {
          maxStorage: MAX_LIMITED_STORAGE_IN_MB * 1000 * 1000,
        },
      },
    }));

    renderWithProviders(<StorageSection />, { store });

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');

    const storageMessage = screen.getByText('dashboard-settings-storage-usage-limited-free');
    expect(storageMessage).toBeInTheDocument();
  });

  test('renders storage section for limited max storage and used full capacity', () => {
    const { store } = configureStore();
    mockUseGetMeQuery.mockImplementation(() => ({
      data: {
        usedStorage: MAX_LIMITED_STORAGE_IN_MB * 1000 * 1000,
      },
    }));
    mockUseGetMeTariffQuery.mockImplementation(() => ({
      data: {
        quotas: {
          maxStorage: MAX_LIMITED_STORAGE_IN_MB * 1000 * 1000,
        },
      },
    }));

    renderWithProviders(<StorageSection />, { store });

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '100');

    const storageMessage = screen.getByText('dashboard-settings-storage-usage-limited-full');
    expect(storageMessage).toBeInTheDocument();
  });

  test('renders storage section for limited max storage and storage is empty', () => {
    const { store } = configureStore();
    mockUseGetMeQuery.mockImplementation(() => ({
      data: {
        usedStorage: 0,
      },
    }));
    mockUseGetMeTariffQuery.mockImplementation(() => ({
      data: {
        quotas: {
          maxStorage: MAX_LIMITED_STORAGE_IN_MB * 1000 * 1000,
        },
      },
    }));

    renderWithProviders(<StorageSection />, { store });

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');

    const storageMessage = screen.getByText('dashboard-settings-storage-usage-limited-free');
    expect(storageMessage).toBeInTheDocument();
  });

  test('renders storage section for unlimited max storage', () => {
    const { store } = configureStore();
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

    renderWithProviders(<StorageSection />, { store });

    const progressBar = screen.queryByRole('progressbar');
    expect(progressBar).not.toBeInTheDocument();

    const storageMessage = screen.getByText('dashboard-settings-storage-usage-unlimited');
    expect(storageMessage).toBeInTheDocument();
  });
});
