// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { MenuList } from '@mui/material';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { enableRaiseHands } from '../../../api/types/outgoing/raiseHands';
import { Role } from '../../../types';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import ToggleHandraisesMenuItem from './ToggleHandraisesMenuItem';

const renderToggleHandraisesMenuItem = (hasHandraisesEnabled: boolean) => {
  const { store, dispatchSpy } = configureStore({
    initialState: {
      user: { role: Role.Moderator },
      moderation: { raiseHandsEnabled: hasHandraisesEnabled },
    },
  });

  renderWithProviders(
    <MenuList>
      <ToggleHandraisesMenuItem onClose={vi.fn()} />
    </MenuList>,
    { store, provider: { mui: true, snackbar: true } }
  );

  return { dispatchSpy };
};

describe('ToggleHandraisesMenuItem', () => {
  it('shows the enable option when handraises are disabled', () => {
    renderToggleHandraisesMenuItem(false);

    expect(screen.getByRole('menuitem', { name: 'more-menu-turn-handraises-on' })).toBeInTheDocument();
  });

  it('shows the disable option when handraises are enabled', () => {
    renderToggleHandraisesMenuItem(true);

    expect(screen.getByRole('menuitem', { name: 'more-menu-turn-handraises-off' })).toBeInTheDocument();
  });

  it('dispatches the enable action when clicked while disabled', async () => {
    const user = userEvent.setup();
    const { dispatchSpy } = renderToggleHandraisesMenuItem(false);

    await user.click(screen.getByRole('menuitem', { name: 'more-menu-turn-handraises-on' }));

    expect(dispatchSpy).toHaveBeenCalledWith(enableRaiseHands.action());
  });
});
