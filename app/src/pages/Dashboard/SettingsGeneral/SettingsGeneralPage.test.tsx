// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, waitFor } from '@testing-library/react';

import { renderWithProviders, configureStore } from '../../../utils/testUtils';
import SettingsGeneralPage from './SettingsGeneralPage';

vi.mock('../../../api/rest', async (importOriginal) => ({
  ...(await importOriginal()),
  useGetMeQuery: () => ({
    data: {
      theme: 'light',
      language: 'de-DE',
    },
  }),
}));

vi.mock('react-i18next', async (importOriginal) => ({
  ...(await importOriginal()),
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      resolvedLanguage: 'de-DE',
      t: (key: string) => key,
    },
  }),
}));

describe('Dashboard SettingsGeneralPage', () => {
  it('renders page without crashing', async () => {
    const { store } = configureStore();
    renderWithProviders(<SettingsGeneralPage />, { store });

    await waitFor(() => {
      expect(screen.getByRole('form')).toBeInTheDocument();
    });
  });
});
