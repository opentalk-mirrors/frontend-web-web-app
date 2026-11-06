// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { MenuList } from '@mui/material';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { setSelfRenameDialogVisible } from '../../../store/slices/uiSlice';
import { ParticipationKind, Role } from '../../../types';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import SelfRenameMenuItem from './SelfRenameMenuItem';

const renderSelfRenameMenuItem = (participationKind: ParticipationKind) => {
  const { store, dispatchSpy } = configureStore({
    initialState: {
      user: {
        role: Role.User,
        participationKind,
      },
      moderation: { selfRenameEnabled: true },
    },
  });

  renderWithProviders(
    <MenuList>
      <SelfRenameMenuItem onClose={vi.fn()} />
    </MenuList>,
    { store, provider: { mui: true, snackbar: true } }
  );

  return { dispatchSpy };
};

describe('SelfRenameMenuItem', () => {
  it('does not render for registered users', () => {
    renderSelfRenameMenuItem(ParticipationKind.Registered);

    expect(screen.queryByRole('menuitem', { name: 'global-rename' })).not.toBeInTheDocument();
  });

  it('renders for unregistered users', () => {
    renderSelfRenameMenuItem(ParticipationKind.Unregistered);

    expect(screen.getByRole('menuitem', { name: 'global-rename' })).toBeInTheDocument();
  });

  it('opens the rename dialog when clicked', async () => {
    const user = userEvent.setup();
    const { dispatchSpy } = renderSelfRenameMenuItem(ParticipationKind.Unregistered);

    await user.click(screen.getByRole('menuitem', { name: 'global-rename' }));

    expect(dispatchSpy).toHaveBeenCalledWith(setSelfRenameDialogVisible(true));
  });
});
