// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import DashboardNavigation from '.';
import { HomeIcon, MeetingsIcon, SettingsIcon } from '../../assets/icons';
import { useAuthActions } from '../../hooks/useAuthActions';
import { renderWithProviders, configureStore } from '../../utils/testUtils';

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

vi.mock('../../api/rest', async (importOriginal) => ({
  ...(await importOriginal()),
  useGetMeQuery: () => ({
    data: {
      displayName: 'Test',
      avatarUrl: 'TestURL',
    },
  }),
}));

vi.mock('../../hooks/useAuthActions', () => ({ useAuthActions: vi.fn() }));

describe('DashboardNavigation', () => {
  const signOut = vi.fn();
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthActions).mockReturnValue({ signIn: vi.fn(), signOut, isAuthAvailable: true });
  });

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
  it('displays the primary navigation', () => {
    renderWithProviders(<DashboardNavigation routes={routes} />, { store, provider: { router: true, mui: true } });

    expect(screen.getByTestId('PrimaryNavigation')).toBeInTheDocument();
  });

  it('populates primary navigation', () => {
    renderWithProviders(<DashboardNavigation routes={routes} />, { store, provider: { router: true, mui: true } });

    expect(screen.getAllByTestId('PrimaryNavItem')).toHaveLength(routes.length);
  });

  it('has closed secondary navigation by default', () => {
    renderWithProviders(<DashboardNavigation routes={routes} />, { store, provider: { router: true, mui: true } });

    expect(screen.queryByTestId('SecondaryNavigation')).toBeNull();
  });

  it('uses the shared sign-out action for dashboard logout', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<DashboardNavigation routes={routes} />, { store, provider: { router: true, mui: true } });

    await user.click(screen.getByRole('button', { name: 'global-logout' }));

    expect(signOut).toHaveBeenCalledExactlyOnceWith();
  });

  it.skip('opens and closes secondary navigation', () => {
    renderWithProviders(<DashboardNavigation routes={routes} />, { store, provider: { router: true, mui: true } });
    const button = screen.getAllByTestId('PrimaryNavItem')[0];

    fireEvent.click(button);

    expect(screen.getByTestId('SecondaryNavigation')).toBeInTheDocument();

    fireEvent.click(button);

    expect(screen.queryByTestId('SecondaryNavigation')).toBeNull();
  });

  it('populates secondary navigation', () => {
    renderWithProviders(<DashboardNavigation routes={routes} />, { store, provider: { router: true, mui: true } });
    const secondaryRoutes = routes[0].childRoutes ? routes[0].childRoutes.length : 0;

    const button = screen.getAllByTestId('PrimaryNavItem')[0];

    fireEvent.click(button);

    expect(screen.getAllByTestId('SecondaryNavItem')).toHaveLength(secondaryRoutes);
  });
});
