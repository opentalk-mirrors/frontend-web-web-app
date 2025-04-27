// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { renderWithProviders, configureStore } from '../../../utils/testUtils';
import SettingsGeneralPage from './SettingsGeneralPage';

jest.mock('../../../api/rest', () => ({
  ...jest.requireActual('../../../api/rest'),
  useGetMeQuery: () => ({
    data: {
      theme: 'light',
      language: 'de-DE',
    },
  }),
}));

describe('Dashboard SettingsGeneralPage', () => {
  it('renders page without crashing', () => {
    const { store } = configureStore();
    renderWithProviders(<SettingsGeneralPage />, { store });

    expect(screen.getByTestId('dashboardSettingsGeneral')).toBeInTheDocument();
  });
});
