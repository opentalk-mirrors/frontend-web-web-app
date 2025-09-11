// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import SettingsAccountPage from './SettingsAccountPage';

vi.mock('../../../api/rest', async (importOriginal) => ({
  ...(await importOriginal()),
  useGetMeQuery: () => ({
    email: 'user@email.org',
    firstname: 'firstname',
    lastname: 'lastname',
  }),
}));

describe('SettingsAccountPage', () => {
  it('page will not crash', () => {
    const { store } = configureStore();
    renderWithProviders(<SettingsAccountPage />, { store, provider: { mui: true } });

    expect(screen.getByText('dashboard-settings-account-title')).toBeInTheDocument();
  });
});
