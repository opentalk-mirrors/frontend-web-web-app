// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import SettingsProfilePage from './SettingsProfilePage';

const mockUpdateMe = jest.fn();

jest.mock('../../../api/rest', () => ({
  ...jest.requireActual('../../../api/rest'),
  useGetMeQuery: () => ({
    data: {
      displayName: 'Test User',
      avatarUrl: 'TestURL',
    },
  }),
  useUpdateMeMutation: () => [
    mockUpdateMe,
    {
      isLoading: false,
    },
  ],
}));

describe('SettingsProfilePage', () => {
  it('page will not crash', () => {
    const { store } = configureStore();
    renderWithProviders(<SettingsProfilePage />, { store, provider: { mui: true } });

    expect(screen.getByText('dashboard-settings-profile-picture')).toBeInTheDocument();
  });
});
