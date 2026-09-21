// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { MenuList } from '@mui/material';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { disableMicrophoneRestrictions } from '../../../api/types/outgoing/moderation';
import { ForceMuteType, Role } from '../../../types';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import ToggleMicrophonesMenuItem from './ToggleMicrophonesMenuItem';

const renderToggleMicrophonesMenuItem = (hasMicrophonesEnabled: boolean) => {
  const { store, dispatchSpy } = configureStore({
    initialState: {
      user: { role: Role.Moderator },
      moderation: {
        forceMute: {
          type: hasMicrophonesEnabled ? ForceMuteType.Disabled : ForceMuteType.Enabled,
          unrestrictedParticipants: [],
        },
      },
    },
  });

  renderWithProviders(
    <MenuList>
      <ToggleMicrophonesMenuItem onClose={vi.fn()} />
    </MenuList>,
    { store, provider: { mui: true, snackbar: true } }
  );

  return { dispatchSpy };
};

describe('ToggleMicrophonesMenuItem', () => {
  it('shows the enable option when microphones are restricted', () => {
    renderToggleMicrophonesMenuItem(false);

    expect(screen.getByRole('menuitem', { name: 'more-menu-enable-microphones' })).toBeInTheDocument();
  });

  it('shows the disable option when microphones are enabled', () => {
    renderToggleMicrophonesMenuItem(true);

    expect(screen.getByRole('menuitem', { name: 'more-menu-disable-microphones' })).toBeInTheDocument();
  });

  it('dispatches the disable restriction action when clicked', async () => {
    const user = userEvent.setup();
    const { dispatchSpy } = renderToggleMicrophonesMenuItem(false);

    await user.click(screen.getByRole('menuitem', { name: 'more-menu-enable-microphones' }));

    expect(dispatchSpy).toHaveBeenCalledWith(disableMicrophoneRestrictions.action());
  });
});
