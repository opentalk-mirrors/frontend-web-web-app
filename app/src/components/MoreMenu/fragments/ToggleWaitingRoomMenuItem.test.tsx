// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { MenuList } from '@mui/material';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { changeWaitingRoomState } from '../../../api/types/outgoing/moderation';
import { Role } from '../../../types';
import { WaitingRoom } from '../../../types/common';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import ToggleWaitingRoomMenuItem from './ToggleWaitingRoomMenuItem';

const renderWaitingRoomMenuItem = (waitingRoomState = WaitingRoom.Disabled, guestAccessEnabled = true) => {
  const { store, dispatchSpy } = configureStore({
    initialState: {
      user: { role: Role.Moderator },
      moderation: { waitingRoom: waitingRoomState, guestAccessEnabled },
    },
  });

  renderWithProviders(
    <MenuList>
      <ToggleWaitingRoomMenuItem onClose={vi.fn()} />
    </MenuList>,
    { store, provider: { mui: true, snackbar: true } }
  );

  return { dispatchSpy };
};

describe('ToggleWaitingRoomMenuItem', () => {
  it('shows the waiting-room trigger with the selected state', () => {
    renderWaitingRoomMenuItem(WaitingRoom.ForAll);

    expect(screen.getByRole('menuitem', { name: 'more-menu-manage-waiting-room' })).toBeInTheDocument();
  });

  it('dispatches the selected waiting-room state when a submenu option is clicked', async () => {
    const user = userEvent.setup();
    const { dispatchSpy } = renderWaitingRoomMenuItem();

    await user.click(screen.getByRole('menuitem', { name: 'more-menu-manage-waiting-room' }));
    await user.click(screen.getByRole('menuitem', { name: 'global-for-all' }));

    expect(dispatchSpy).toHaveBeenCalledWith(changeWaitingRoomState.action({ newState: WaitingRoom.ForAll }));
  });
});
