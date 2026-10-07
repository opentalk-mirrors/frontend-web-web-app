// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { BackendModules } from '@opentalk/rest-api-rtk-query';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { enableSelfRename } from '../../api/types/outgoing/moderation';
import { ForceMuteType, Role } from '../../types';
import { configureStore, renderWithProviders } from '../../utils/testUtils';
import MenuButton from './MoreButton';
import MoreMenu from './MoreMenu';

const renderMenu = (initialState = {}) => {
  const { store } = configureStore({ initialState });
  renderWithProviders(<MoreMenu anchorEl={document.createElement('div')} onClose={vi.fn()} open />, {
    store,
    provider: { snackbar: true, mui: true },
  });
  return store;
};

describe('MoreMenu', () => {
  it('renders the MoreMenu button', () => {
    const { store } = configureStore();
    renderWithProviders(<MenuButton />, { store, provider: { snackbar: true, mui: true } });

    expect(screen.getByTestId('toolbarMenuButton')).toBeInTheDocument();
    expect(screen.queryByTestId('moreMenu')).not.toBeInTheDocument();
  });

  it('opens the menu after clicking the MoreMenu button', async () => {
    const user = userEvent.setup();
    const { store } = configureStore();
    renderWithProviders(<MenuButton />, { store, provider: { snackbar: true, mui: true } });

    await user.click(screen.getByTestId('toolbarMenuButton'));

    expect(screen.getByTestId('moreMenu')).toBeInTheDocument();
  });

  it('shows the attendance report option when the meeting report module is enabled', () => {
    renderMenu({
      user: { role: Role.Moderator },
      room: { isOwnedByCurrentUser: true },
      config: {
        provider: { accountManagementUrl: 'https://account.opentalk.eu' },
        enabledModules: { [BackendModules.MeetingReport]: [] },
      },
    });

    expect(screen.getByRole('menuitem', { name: 'more-menu-export-attendance-report' })).toBeInTheDocument();
  });

  it('shows the training participation option when its module is enabled', () => {
    renderMenu({
      user: { role: Role.Moderator },
      room: { isOwnedByCurrentUser: true },
      config: {
        provider: { accountManagementUrl: 'https://account.opentalk.eu' },
        enabledModules: { [BackendModules.TrainingParticipationReport]: [] },
      },
    });

    expect(screen.getByRole('menuitem', { name: 'training-participation-logging-enable-button' })).toBeInTheDocument();
  });

  it('dispatches the self-rename action when self-rename is disabled', async () => {
    const user = userEvent.setup();
    const { store, dispatchSpy } = configureStore({
      initialState: {
        user: { role: Role.Moderator },
        room: { isOwnedByCurrentUser: true },
      },
    });
    renderWithProviders(<MoreMenu anchorEl={document.createElement('div')} onClose={vi.fn()} open />, {
      store,
      provider: { snackbar: true, mui: true },
    });

    await user.click(screen.getByRole('menuitem', { name: 'more-menu-disable-display-name-change-restrictions' }));

    expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: enableSelfRename.action.type }));
  });

  it('shows the enable microphone option when microphones are restricted', () => {
    renderMenu({
      user: { role: Role.Moderator },
      room: { isOwnedByCurrentUser: true },
      moderation: { forceMute: { type: ForceMuteType.Enabled, unrestrictedParticipants: [] } },
    });

    expect(screen.getByRole('menuitem', { name: 'more-menu-enable-microphones' })).toBeInTheDocument();
  });
});
