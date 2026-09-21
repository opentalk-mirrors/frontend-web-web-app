// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { MenuList } from '@mui/material';
import { BackendModules } from '@opentalk/rest-api-rtk-query';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { disableReactionRestrictions, enableReactionRestrictions } from '../../../api/types/outgoing/reaction';
import { Role } from '../../../types';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import ToggleReactionRestrictionsMenuItem from './ToggleReactionRestrictionsMenuItem';

const renderToggleReactionRestrictionsMenuItem = (enabled: boolean, moduleEnabled = true) => {
  const { store, dispatchSpy } = configureStore({
    initialState: {
      user: { role: Role.Moderator },
      reaction: {
        restrictionsState: enabled ? { type: 'enabled', unrestrictedParticipants: [] } : { type: 'disabled' },
        activeReactions: {},
        floatingReaction: [],
      },
      config: { enabledModules: moduleEnabled ? { [BackendModules.Reaction]: [] } : {} },
    },
  });

  renderWithProviders(
    <MenuList>
      <ToggleReactionRestrictionsMenuItem onClose={vi.fn()} />
    </MenuList>,
    { store, provider: { mui: true, snackbar: true } }
  );

  return { dispatchSpy };
};

describe('ToggleReactionRestrictionsMenuItem', () => {
  it('does not render when the reaction module is disabled', () => {
    renderToggleReactionRestrictionsMenuItem(false, false);

    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
  });

  it('shows the enable option when reaction restrictions are enabled', () => {
    renderToggleReactionRestrictionsMenuItem(true);

    expect(screen.getByRole('menuitem', { name: 'more-menu-enable-reaction' })).toBeInTheDocument();
  });

  it('shows the disable option when reaction restrictions are disabled', () => {
    renderToggleReactionRestrictionsMenuItem(false);

    expect(screen.getByRole('menuitem', { name: 'more-menu-disable-reaction' })).toBeInTheDocument();
  });

  it('dispatches the enable restriction action when clicked while disabled', async () => {
    const user = userEvent.setup();
    const { dispatchSpy } = renderToggleReactionRestrictionsMenuItem(false);

    await user.click(screen.getByRole('menuitem', { name: 'more-menu-disable-reaction' }));

    expect(dispatchSpy).toHaveBeenCalledWith(enableReactionRestrictions.action({ unrestrictedParticipants: [] }));
  });

  it('dispatches the disable restriction action when clicked while enabled', async () => {
    const user = userEvent.setup();
    const { dispatchSpy } = renderToggleReactionRestrictionsMenuItem(true);

    await user.click(screen.getByRole('menuitem', { name: 'more-menu-enable-reaction' }));

    expect(dispatchSpy).toHaveBeenCalledWith(disableReactionRestrictions.action());
  });
});
