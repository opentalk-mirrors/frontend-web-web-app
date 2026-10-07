// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { MenuList } from '@mui/material';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { enableSelfRename } from '../../../api/types/outgoing/moderation';
import { Role } from '../../../types';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import ToggleSelfRenameMenuItem from './ToggleSelfRenameMenuItem';

const renderToggleSelfRenameMenuItem = (enabled: boolean) => {
  const { store, dispatchSpy } = configureStore({
    initialState: {
      user: { role: Role.Moderator },
      moderation: {
        selfRenameEnabled: enabled,
        forceMute: { type: 'disabled', unrestrictedParticipants: [] },
      },
    },
  });

  renderWithProviders(
    <MenuList>
      <ToggleSelfRenameMenuItem onClose={vi.fn()} />
    </MenuList>,
    { store, provider: { mui: true, snackbar: true } }
  );

  return { dispatchSpy };
};

describe('ToggleSelfRenameMenuItem', () => {
  it('shows the enable restrictions option when self-rename is enabled', () => {
    renderToggleSelfRenameMenuItem(true);

    expect(
      screen.getByRole('menuitem', { name: 'more-menu-enable-display-name-change-restrictions' })
    ).toBeInTheDocument();
  });

  it('shows the disable restrictions option when self-rename is disabled', () => {
    renderToggleSelfRenameMenuItem(false);

    expect(
      screen.getByRole('menuitem', { name: 'more-menu-disable-display-name-change-restrictions' })
    ).toBeInTheDocument();
  });

  it('dispatches the enable self-rename action when clicked while disabled', async () => {
    const user = userEvent.setup();
    const { dispatchSpy } = renderToggleSelfRenameMenuItem(false);

    await user.click(screen.getByRole('menuitem', { name: 'more-menu-disable-display-name-change-restrictions' }));

    expect(dispatchSpy).toHaveBeenCalledWith(enableSelfRename.action());
  });
});
