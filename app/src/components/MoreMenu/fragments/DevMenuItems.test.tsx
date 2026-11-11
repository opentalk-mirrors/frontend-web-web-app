// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { BackendModules } from '@opentalk/rest-api-rtk-query';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { triggerPresenceCheck } from '../../../api/types/outgoing/trainingParticipationReport';
import { notifications } from '../../../commonComponents';
import { trainingParticipationReportEnabled } from '../../../store/slices/moderationSlice';
import { Role } from '../../../types';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import MoreMenu from '../MoreMenu';

vi.mock('../../../commonComponents', async (importOriginal) => ({
  ...(await importOriginal()),
  notifications: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('DevMenuItems', () => {
  beforeEach(() => {
    window.localStorage.setItem('devMode', 'true');
  });

  it('shows success notification when show test info option is clicked', async () => {
    const user = userEvent.setup();
    const { store } = configureStore();
    renderWithProviders(<MoreMenu open anchorEl={document.createElement('div')} onClose={vi.fn()} />, {
      store,
      provider: { snackbar: true, mui: true },
    });
    const spyNotificationsSuccess = vi.spyOn(notifications, 'success');

    await user.click(screen.getByText('Show Test Info'));

    expect(spyNotificationsSuccess).toHaveBeenCalledExactlyOnceWith('You just triggered this notification. Success!');
  });

  it('shows error notification when show test error option is clicked', async () => {
    const user = userEvent.setup();
    const { store } = configureStore();
    renderWithProviders(<MoreMenu open anchorEl={document.createElement('div')} onClose={vi.fn()} />, {
      store,
      provider: { snackbar: true, mui: true },
    });
    const spyNotificationsError = vi.spyOn(notifications, 'error');

    await user.click(screen.getByText('Show Test Error'));

    expect(spyNotificationsError).toHaveBeenCalledExactlyOnceWith('Test error context: Error: Test Error');
  });

  it('hides the trigger presence check button when presence logging is not enabled', async () => {
    const { store } = configureStore({
      initialState: {
        user: { role: Role.Moderator },
        room: { isOwnedByCurrentUser: true },
        config: {
          provider: {
            accountManagementUrl: 'https://account.opentalk.eu',
          },
          enabledModules: { [BackendModules.TrainingParticipationReport]: [] },
        },
      },
    });

    renderWithProviders(<MoreMenu anchorEl={document.createElement('div')} onClose={() => vi.fn()} open />, {
      store,
      provider: { snackbar: true, mui: true },
    });

    expect(await screen.findByText('Show Test Info')).toBeInTheDocument();
    expect(screen.queryByText('Trigger presence check')).not.toBeInTheDocument();
  });

  it('dispatches trigger presence check when presence logging is enabled', async () => {
    const user = userEvent.setup();
    const { store, dispatchSpy } = configureStore({
      initialState: {
        user: { role: Role.Moderator },
        room: { isOwnedByCurrentUser: true },
        config: {
          provider: {
            accountManagementUrl: 'https://account.opentalk.eu',
          },
          enabledModules: { [BackendModules.TrainingParticipationReport]: [] },
        },
      },
    });
    store.dispatch(trainingParticipationReportEnabled());

    renderWithProviders(<MoreMenu anchorEl={document.createElement('div')} onClose={() => vi.fn()} open />, {
      store,
      provider: { snackbar: true, mui: true },
    });

    await user.click(await screen.findByText('Trigger presence check'));

    expect(dispatchSpy).toHaveBeenCalledWith(triggerPresenceCheck.action());
  });
});
