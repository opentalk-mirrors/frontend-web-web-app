// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { mockChangeLanguage } from '../../../../setupTests';
import { renderWithProviders, configureStore } from '../../../../utils/testUtils';
import LanguageSelector from './LanguageSelector';

const mockUpdateMe = vi.fn();

const mockSuccessNotification = vi.fn();
vi.mock('../../../../commonComponents/Notistack/fragments/utils', () => ({
  ...vi.importActual('../../../../commonComponents/Notistack/fragments/utils'),
  notifications: {
    success: (key: string) => mockSuccessNotification(key),
  },
}));

vi.mock('../../../../api/rest', async (importOriginal) => ({
  ...(await importOriginal()),
  useGetMeQuery: () => ({
    data: {
      theme: 'light',
      language: 'en-US',
    },
  }),
  useUpdateMeMutation: () => [
    mockUpdateMe,
    {
      isLoading: false,
    },
  ],
}));

describe('LanguageSelector', () => {
  const { store } = configureStore();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWithProviders(<LanguageSelector />, { store });

    expect(screen.getByDisplayValue('en-US')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'dashboard-settings-profile-button-save' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'dashboard-settings-general-language' })).toBeInTheDocument();
  });

  it('updates on Save button', async () => {
    renderWithProviders(<LanguageSelector />, { store });

    const saveButton = screen.getByRole('button', { name: /dashboard-settings-profile-button-save/i });
    expect(saveButton).toBeInTheDocument();

    fireEvent.click(saveButton);
    await waitFor(() => {
      expect(mockUpdateMe).toHaveBeenCalledTimes(1);
    });
  });

  it('triggers a success notification on successful update', async () => {
    renderWithProviders(<LanguageSelector />, { store, provider: { snackbar: true } });

    const saveButton = screen.getByRole('button', { name: /dashboard-settings-profile-button-save/i });
    expect(saveButton).toBeInTheDocument();

    fireEvent.click(saveButton);
    await waitFor(() => {
      expect(mockChangeLanguage).toHaveBeenCalled();
    });
    expect(mockSuccessNotification).toHaveBeenCalledExactlyOnceWith(
      'dashboard-settings-general-notification-save-success'
    );
  });
});
