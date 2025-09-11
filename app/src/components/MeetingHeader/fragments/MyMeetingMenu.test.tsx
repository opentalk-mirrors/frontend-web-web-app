// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import MyMeetingMenu from './MyMeetingMenu';

vi.mock('../../../utils/apiUtils');

describe('My Meeting Menu', () => {
  it('renders menu and all default menu items on button click', async () => {
    const { store } = configureStore();
    renderWithProviders(<MyMeetingMenu />, { store, provider: { mui: true } });

    const menuButton = await screen.findByRole('button', { name: 'my-meeting-menu' });
    expect(menuButton).toBeInTheDocument();

    fireEvent.click(menuButton);

    const menu = await screen.findByRole('menu', { name: 'my-meeting-menu' });
    expect(menu).toBeInTheDocument();

    const userManualMenuItem = screen.getByRole('menuitem', {
      name: 'my-meeting-menu-user-manual global-open-new-tab',
    });
    expect(userManualMenuItem).toBeInTheDocument();

    const shortcutsMenuItem = screen.getByRole('menuitem', { name: 'my-meeting-menu-keyboard-shortcuts' });
    expect(shortcutsMenuItem).toBeInTheDocument();
  });

  it('does not show Report error button if glitchtip is not configured', async () => {
    const { store } = configureStore({
      initialState: {
        config: {
          glitchtip: {},
        },
      },
    });

    renderWithProviders(<MyMeetingMenu />, { store, provider: { mui: true } });

    const menuButton = await screen.findByRole('button', { name: 'my-meeting-menu' });
    fireEvent.click(menuButton);

    const reportBugMenuItem = screen.queryByRole('menuitem', { name: 'my-meeting-menu-glitchtip-trigger' });
    await waitFor(() => expect(reportBugMenuItem).not.toBeInTheDocument());
  });

  it('shows Report error button when glitchtip dsn is configured', async () => {
    const { store } = configureStore({
      initialState: {
        config: {
          glitchtip: {
            dsn: 'glitchtip.com',
          },
        },
      },
    });
    renderWithProviders(<MyMeetingMenu />, { store, provider: { mui: true } });

    const menuButton = await screen.findByRole('button', { name: 'my-meeting-menu' });
    fireEvent.click(menuButton);

    const reportBugMenuItem = await screen.findByRole('menuitem', { name: 'my-meeting-menu-glitchtip-trigger' });
    expect(reportBugMenuItem).toBeInTheDocument();
  });

  it('opens user manual when clicking on User Manual option', async () => {
    const { store } = configureStore();
    renderWithProviders(<MyMeetingMenu />, { store, provider: { mui: true } });

    const menuButton = await screen.findByRole('button', { name: 'my-meeting-menu' });
    fireEvent.click(menuButton);

    const menuItem = await screen.findByRole('menuitem', { name: 'my-meeting-menu-user-manual global-open-new-tab' });

    expect(menuItem).toBeInTheDocument();
    expect(menuItem).toHaveAttribute('href', 'https://docs.opentalk.eu/user/manual/');
    expect(menuItem).not.toBeDisabled();
  });
});
