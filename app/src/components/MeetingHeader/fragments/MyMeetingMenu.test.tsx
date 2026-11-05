// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import MyMeetingMenu from './MyMeetingMenu';

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

    const hotkeysMenuItem = screen.getByRole('menuitem', { name: 'my-meeting-menu-keyboard-hotkeys' });
    expect(hotkeysMenuItem).toBeInTheDocument();
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

  it.each([
    [undefined, 'https://docs.opentalk.eu/user/manual/'],
    ['', 'https://docs.opentalk.eu/user/manual/'],
    ['https://example.com/manual', 'https://example.com/manual'],
  ])('uses the user manual URL configured as %s', async (userManualUrl, expectedUrl) => {
    const user = userEvent.setup();
    const { store } = configureStore({ initialState: { config: { userManualUrl } } });
    renderWithProviders(<MyMeetingMenu />, { store, provider: { mui: true } });

    const menuButton = await screen.findByRole('button', { name: 'my-meeting-menu' });
    await user.click(menuButton);

    const menuItem = await screen.findByRole('menuitem', { name: 'my-meeting-menu-user-manual global-open-new-tab' });

    expect(menuItem).toBeInTheDocument();
    expect(menuItem).toHaveAttribute('href', expectedUrl);
    expect(menuItem).toHaveAttribute('target', '_blank');
    expect(menuItem).not.toBeDisabled();
  });
});
