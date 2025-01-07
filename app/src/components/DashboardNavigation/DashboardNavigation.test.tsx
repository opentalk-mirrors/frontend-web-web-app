// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { setTimeout } from 'timers';

import DashboardNavigation from '.';
import { HomeIcon, MeetingsIcon, SettingsIcon } from '../../assets/icons';
import { screen, render, fireEvent, configureStore, waitFor } from '../../utils/testUtils';

const routes = [
  {
    icon: <SettingsIcon />,
    path: 'settings',
    name: 'dashboard-settings',
    childRoutes: [
      {
        path: '',
        name: 'dashboard-settings-general',
      },
      {
        path: 'account',
        name: 'dashboard-settings-account',
      },
      {
        path: 'profile',
        name: 'dashboard-settings-profile',
      },
    ],
  },
  {
    icon: <HomeIcon />,
    path: 'dashboard',
    name: 'dashboard-home',
  },
  {
    icon: <MeetingsIcon />,
    path: 'meetings',
    name: 'dashboard-meetings',
  },
];

jest.mock('../../api/rest', () => ({
  ...jest.requireActual('../../api/rest'),
  useGetMeQuery: () => ({
    data: {
      displayName: 'Test',
      avatarUrl: 'TestURL',
    },
  }),
}));

describe('dashboard navigation', () => {
  const { store } = configureStore({
    initialState: {
      config: {
        oidcConfig: {
          authority: 'http://test-url',
        },
        provider: {
          accountManagementUrl: 'http://localhost:3000',
        },
      },
    },
  });
  test('displays the primary navigation', async () => {
    await render(<DashboardNavigation routes={routes} />, store);

    expect(screen.getByTestId('PrimaryNavigation')).toBeInTheDocument();
  });

  test('populates primary navigation', async () => {
    await render(<DashboardNavigation routes={routes} />, store);

    expect(screen.getAllByTestId('PrimaryNavItem')).toHaveLength(routes.length);
  });

  test('has closed secondary navigation by default', async () => {
    await render(<DashboardNavigation routes={routes} />, store);

    expect(screen.queryByTestId('SecondaryNavigation')).toBeNull();
  });

  // commented out in case of this setTimeout causes problems in infects other tests for some reason
  test.skip('opens and closes secondary navigation', async () => {
    await render(<DashboardNavigation routes={routes} />, store);
    const button = screen.getAllByTestId('PrimaryNavItem')[0];

    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('SecondaryNavigation')).toBeInTheDocument();
    });

    fireEvent.click(button);

    await waitFor(() => {
      setTimeout(() => {
        expect(screen.queryByTestId('SecondaryNavigation')).toBeNull();
      }, 300);
    });
  });

  test('populates secondary navigation', async () => {
    await render(<DashboardNavigation routes={routes} />, store);
    const secondaryRoutes = routes[0].childRoutes ? routes[0].childRoutes.length : 0;

    const button = screen.getAllByTestId('PrimaryNavItem')[0];

    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getAllByTestId('SecondaryNavItem')).toHaveLength(secondaryRoutes);
    });
  });
});
