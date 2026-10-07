// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { MenuList } from '@mui/material';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Role } from '../../../types';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import RemoteControlMenuItem from './RemoteControlMenuItem';

const renderRemoteControlMenuItem = (innovafoneAPI: boolean) => {
  const { store } = configureStore({
    initialState: {
      user: { role: Role.User },
      config: { features: { innovafoneAPI } },
    },
  });

  renderWithProviders(
    <MenuList>
      <RemoteControlMenuItem />
    </MenuList>,
    { store, provider: { mui: true, snackbar: true } }
  );
};

describe('RemoteControlMenuItem', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not render when the innovaphone API feature is disabled', () => {
    renderRemoteControlMenuItem(false);

    expect(screen.queryByRole('menuitem', { name: 'more-menu-start-remote-control' })).not.toBeInTheDocument();
  });

  it('renders when the innovaphone API feature is enabled', () => {
    renderRemoteControlMenuItem(true);

    expect(screen.getByRole('menuitem', { name: 'more-menu-start-remote-control' })).toBeInTheDocument();
  });

  it('opens the remote-control app when clicked', async () => {
    const user = userEvent.setup();
    renderRemoteControlMenuItem(true);
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    await user.click(screen.getByRole('menuitem', { name: 'more-menu-start-remote-control' }));

    expect(openSpy).toHaveBeenCalledWith('com.innovaphone.myapps:remotecontrol', '_blank');
  });
});
