// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import * as apiUtils from '../../../utils/apiUtils';
import { configureStore, fireEvent, render, screen } from '../../../utils/testUtils';
import MyMeetingMenu from './MyMeetingMenu';

jest.mock('../../../utils/apiUtils');

describe('My Meeting Menu', () => {
  test('render menu and all default menu items on button click', async () => {
    const { store } = configureStore();
    await render(<MyMeetingMenu />, store);

    const menuButton = screen.getByRole('button', { name: 'my-meeting-menu' });
    expect(menuButton).toBeInTheDocument();

    fireEvent.click(menuButton);

    const menu = screen.getByRole('menu', { name: 'my-meeting-menu' });
    expect(menu).toBeInTheDocument();

    const userManualMenuItem = screen.getByRole('menuitem', { name: 'my-meeting-menu-user-manual' });
    expect(userManualMenuItem).toBeInTheDocument();

    const shortcutsMenuItem = screen.getByRole('menuitem', { name: 'my-meeting-menu-keyboard-shortcuts' });
    expect(shortcutsMenuItem).toBeInTheDocument();
  });
  test('Report error button is not visible if glitchtip is not configured', async () => {
    const { store } = configureStore({
      initialState: {
        config: {
          glitchtip: {},
        },
      },
    });

    await render(<MyMeetingMenu />, store);

    const menuButton = screen.getByRole('button', { name: 'my-meeting-menu' });
    fireEvent.click(menuButton);

    const reportBugMenuItem = screen.queryByRole('menuitem', { name: 'my-meeting-menu-glitchtip-trigger' });
    expect(reportBugMenuItem).not.toBeInTheDocument();
  });
  test('Report error button is visible when glitchtip dsn is configured', async () => {
    const { store } = configureStore({
      initialState: {
        config: {
          glitchtip: {
            dsn: 'glitchtip.com',
          },
        },
      },
    });
    await render(<MyMeetingMenu />, store);

    const menuButton = screen.getByRole('button', { name: 'my-meeting-menu' });
    fireEvent.click(menuButton);

    const reportBugMenuItem = screen.getByRole('menuitem', { name: 'my-meeting-menu-glitchtip-trigger' });
    expect(reportBugMenuItem).toBeInTheDocument();
  });
  test('click on User Manual option opens user manual', async () => {
    const openUserManualSpy = jest.spyOn(apiUtils, 'openUserManual');

    const { store } = configureStore();
    await render(<MyMeetingMenu />, store);

    const menuButton = screen.getByRole('button', { name: 'my-meeting-menu' });
    fireEvent.click(menuButton);

    const userManualMenuItem = screen.getByRole('menuitem', { name: 'my-meeting-menu-user-manual' });
    fireEvent.click(userManualMenuItem);

    expect(openUserManualSpy).toHaveBeenCalled();
    openUserManualSpy.mockRestore();
  });
});
