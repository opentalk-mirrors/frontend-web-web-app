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

const renderSelfRenameMenuItem = (isGuest: boolean) => {
  const { store, dispatchSpy } = configureStore({
    initialState: {
      user: {
        role: Role.User,
        participationKind: isGuest ? ParticipationKind.Guest : ParticipationKind.Registered,
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
  it('does not render for non-guests', () => {
    renderSelfRenameMenuItem(false);

    expect(screen.queryByRole('menuitem', { name: 'global-rename' })).not.toBeInTheDocument();
  });

  it('renders for guests', () => {
    renderSelfRenameMenuItem(true);

    expect(screen.getByRole('menuitem', { name: 'global-rename' })).toBeInTheDocument();
  });

  it('opens the rename dialog when clicked', async () => {
    const user = userEvent.setup();
    const { dispatchSpy } = renderSelfRenameMenuItem(true);

    await user.click(screen.getByRole('menuitem', { name: 'global-rename' }));

    expect(dispatchSpy).toHaveBeenCalledWith(setSelfRenameDialogVisible(true));
  });
});
