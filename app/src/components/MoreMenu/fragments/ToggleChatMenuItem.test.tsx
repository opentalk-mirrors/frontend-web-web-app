// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { MenuList } from '@mui/material';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { enableChat } from '../../../api/types/outgoing/chat';
import { Role } from '../../../types';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import ToggleChatMenuItem from './ToggleChatMenuItem';

vi.mock('@livekit/components-react', async (importOriginal) => ({
  ...(await importOriginal()),
  ChatIcon: () => <span data-testid="chat-icon" />,
}));

const renderToggleChatMenuItem = (enabled: boolean) => {
  const { store, dispatchSpy } = configureStore({
    initialState: {
      user: { role: Role.Moderator },
      chat: { settings: { enabled } },
    },
  });

  renderWithProviders(
    <MenuList>
      <ToggleChatMenuItem onClose={vi.fn()} />
    </MenuList>,
    { store, provider: { mui: true, snackbar: true } }
  );

  return { dispatchSpy };
};

describe('ToggleChatMenuItem', () => {
  it('shows the disable option when chat is enabled', () => {
    renderToggleChatMenuItem(true);

    expect(screen.getByRole('menuitem', { name: 'more-menu-disable-chat' })).toBeInTheDocument();
  });

  it('shows the enable option when chat is disabled', () => {
    renderToggleChatMenuItem(false);

    expect(screen.getByRole('menuitem', { name: 'more-menu-enable-chat' })).toBeInTheDocument();
  });

  it('dispatches the enable action when clicked while disabled', async () => {
    const user = userEvent.setup();
    const { dispatchSpy } = renderToggleChatMenuItem(false);

    await user.click(screen.getByRole('menuitem', { name: 'more-menu-enable-chat' }));

    expect(dispatchSpy).toHaveBeenCalledWith(enableChat.action());
  });
});
