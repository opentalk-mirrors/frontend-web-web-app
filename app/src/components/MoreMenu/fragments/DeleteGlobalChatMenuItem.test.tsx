// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { MenuList } from '@mui/material';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { clearGlobalChatMessages } from '../../../api/types/outgoing/chat';
import { Role } from '../../../types';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import DeleteGlobalChatMenuItem from './DeleteGlobalChatMenuItem';

it('dispatches the global chat deletion action when clicked', async () => {
  const user = userEvent.setup();
  const { store, dispatchSpy } = configureStore({ initialState: { user: { role: Role.Moderator } } });
  renderWithProviders(
    <MenuList>
      <DeleteGlobalChatMenuItem onClose={vi.fn()} />
    </MenuList>,
    { store, provider: { mui: true, snackbar: true } }
  );

  await user.click(screen.getByRole('menuitem', { name: 'more-menu-delete-global-chat' }));

  expect(dispatchSpy).toHaveBeenCalledWith(clearGlobalChatMessages.action());
});
