// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { MenuList } from '@mui/material';
import { BackendModules } from '@opentalk/rest-api-rtk-query';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { enablePresenceLogging } from '../../../api/types/outgoing/trainingParticipationReport';
import { Role } from '../../../types';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import TogglePresenceLoggingMenuItem from './TogglePresenceLoggingMenuItem';

const renderTogglePresenceLoggingMenuItem = (
  enabled: boolean,
  options: { isRoomOwner?: boolean; moduleEnabled?: boolean } = {}
) => {
  const { store, dispatchSpy } = configureStore({
    initialState: {
      user: { role: Role.Moderator },
      room: { isOwnedByCurrentUser: options.isRoomOwner ?? true },
      moderation: { trainingParticipationReportEnabled: enabled },
      config: {
        provider: { accountManagementUrl: 'https://account.opentalk.eu' },
        enabledModules: options.moduleEnabled === false ? {} : { [BackendModules.TrainingParticipationReport]: [] },
      },
    },
  });

  renderWithProviders(
    <MenuList>
      <TogglePresenceLoggingMenuItem onClose={vi.fn()} />
    </MenuList>,
    { store, provider: { mui: true, snackbar: true } }
  );

  return { dispatchSpy };
};

describe('TogglePresenceLoggingMenuItem', () => {
  it('does not render when the current user is not the room owner', () => {
    renderTogglePresenceLoggingMenuItem(false, { isRoomOwner: false });

    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
  });

  it('does not render when the training participation report module is disabled', () => {
    renderTogglePresenceLoggingMenuItem(false, { moduleEnabled: false });

    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
  });

  it('shows the enable option when presence logging is disabled', () => {
    renderTogglePresenceLoggingMenuItem(false);

    expect(screen.getByRole('menuitem', { name: 'training-participation-logging-enable-button' })).toBeInTheDocument();
  });

  it('shows the disable option when presence logging is enabled', () => {
    renderTogglePresenceLoggingMenuItem(true);

    expect(screen.getByRole('menuitem', { name: 'training-participation-logging-disable-button' })).toBeInTheDocument();
  });

  it('dispatches the enable action when clicked while disabled', async () => {
    const user = userEvent.setup();
    const { dispatchSpy } = renderTogglePresenceLoggingMenuItem(false);

    await user.click(screen.getByRole('menuitem', { name: 'training-participation-logging-enable-button' }));

    expect(dispatchSpy).toHaveBeenCalledWith(enablePresenceLogging.action({}));
  });
});
