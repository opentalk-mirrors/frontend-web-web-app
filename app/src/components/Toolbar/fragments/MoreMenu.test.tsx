// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
// Switch off the rule, as it doesn't recognize assertion in the utility helper function
// Maybe it's a bug or maybe it's not a good practice to use this kind of helper function
/* eslint-disable vitest/expect-expect */
import { screen, fireEvent } from '@testing-library/react';

import { notifications } from '../../../commonComponents';
import { ForceMuteType, Role } from '../../../types';
import { renderWithProviders, configureStore } from '../../../utils/testUtils';
import MenuButton from './MoreButton';
import MoreMenu from './MoreMenu';

vi.mock('../../../commonComponents', async (importOriginal) => ({
  ...(await importOriginal()),
  notifications: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('./InviteGuestDialog', () => ({
  __esModule: true,
  default: ({ open }: { open: boolean }) => {
    return (
      <div data-testid="invite-guest-dialog">
        <span>{open ? 'Invite Guest Open' : undefined}</span>
      </div>
    );
  },
}));

describe('<MoreButton />', () => {
  const { store } = configureStore();

  const checkMenuItem = (name: string, falsify?: boolean) => {
    if (falsify) {
      expect(screen.queryByRole('menuitem', { name })).not.toBeInTheDocument();
    } else {
      expect(screen.getByRole('menuitem', { name })).toBeInTheDocument();
    }
  };

  it('renders MoreMenuButton component', () => {
    renderWithProviders(<MenuButton />, { store, provider: { snackbar: true, mui: true } });

    expect(screen.getByTestId('toolbarMenuButton')).toBeInTheDocument();
    expect(screen.queryByTestId('moreMenu')).not.toBeInTheDocument();
  });

  it('renders moreMenu after clicking on MoreMenuButton', () => {
    renderWithProviders(<MenuButton />, { store, provider: { snackbar: true, mui: true } });
    const button = screen.getByTestId('toolbarMenuButton');
    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    expect(screen.getByTestId('moreMenu')).toBeInTheDocument();
  });
  describe('if the user is a moderator and room owner', () => {
    const setup = () =>
      renderWithProviders(<MoreMenu anchorEl={document.createElement('div')} onClose={() => vi.fn()} open />, {
        store,
        provider: { snackbar: true, mui: true },
      });

    const moderatorState = { user: { role: Role.Moderator }, room: { isOwnedByCurrentUser: true } };
    const { store } = configureStore({ initialState: { ...moderatorState } });

    describe('invite guest options', () => {
      it('does not render invite guest options if the guests allowed feature is not enabled', () => {
        setup();
        expect(screen.queryByRole('menuitem', { name: 'more-menu-create-invite' })).not.toBeInTheDocument();
      });
      it('renders invite guest options if the guests allowed feature is enabled', () => {
        const { store: storeWithGuestsAllowed } = configureStore({
          initialState: {
            ...moderatorState,
            config: { tariff: { modules: { core: { features: ['guests_allowed'] } } } },
          },
        });
        renderWithProviders(<MoreMenu anchorEl={document.createElement('div')} onClose={() => vi.fn()} open />, {
          store: storeWithGuestsAllowed,
          provider: { snackbar: true, mui: true },
        });
        expect(screen.getByRole('menuitem', { name: 'more-menu-create-invite' })).toBeInTheDocument();
      });
      it('renders inivte guest dialog and it"s closed by default', () => {
        setup();
        expect(screen.getByTestId('invite-guest-dialog')).toBeInTheDocument();
        expect(screen.queryByText('Invite Guest Open')).not.toBeInTheDocument();
      });
      it('opens invite guest dialog when user clicks on inivte guest menu option', () => {
        const { store: storeWithGuestsAllowed } = configureStore({
          initialState: {
            ...moderatorState,
            config: { tariff: { modules: { core: { features: ['guests_allowed'] } } } },
          },
        });
        renderWithProviders(<MoreMenu anchorEl={document.createElement('div')} onClose={() => vi.fn()} open />, {
          store: storeWithGuestsAllowed,
          provider: { snackbar: true, mui: true },
        });
        const inviteGuest = screen.getByRole('menuitem', { name: 'more-menu-create-invite' });
        fireEvent.click(inviteGuest);
        expect(screen.getByText('Invite Guest Open')).toBeInTheDocument();
      });
    });

    it('shows the enable waiting room option and does not show the disable waiting room option, if the waiting room is inactive', () => {
      setup();
      checkMenuItem('more-menu-enable-waiting-room');
      checkMenuItem('more-menu-disable-waiting-room', true);
    });

    it('does not show meeting notes export option, if the meeting notes module is disabled', () => {
      setup();
      checkMenuItem('more-menu-export-attendance-report', true);
    });
    describe('training participation report options', () => {
      describe('if the module is enabled', () => {
        const config = { tariff: { modules: { trainingParticipationReport: { features: [] } } } };

        it('shows the enable training participation logging button, if the logging is disabled, and does not show the disable button', () => {
          const { store: storeWithModules } = configureStore({ initialState: { ...moderatorState, config } });
          renderWithProviders(<MoreMenu anchorEl={document.createElement('div')} onClose={() => vi.fn()} open />, {
            store: storeWithModules,
            provider: { mui: true, snackbar: true },
          });
          checkMenuItem('training-participation-logging-enable-button');
          checkMenuItem('training-participation-logging-disable-button', true);
        });
        it('shows the disable training participation logging button, if the logging is enabled, and does not show the enable button', () => {
          const { store: storeWithModules } = configureStore({
            initialState: {
              ...moderatorState,
              config,
              moderation: {
                forceMute: { type: ForceMuteType.Disabled, unrestrictedParticipants: [] },
                trainingParticipationReportEnabled: true,
              },
            },
          });
          renderWithProviders(<MoreMenu anchorEl={document.createElement('div')} onClose={() => vi.fn()} open />, {
            store: storeWithModules,
            provider: { mui: true, snackbar: true },
          });
          checkMenuItem('training-participation-logging-enable-button', true);
          checkMenuItem('training-participation-logging-disable-button');
        });
      });
      describe('if the module is disabled', () => {
        it('does not show training participation options', () => {
          checkMenuItem('training-participation-logging-enable-button', true);
          checkMenuItem('training-participation-logging-disable-button', true);
        });
      });
    });
    it('shows enable handraises option and does not show the disable handraises option, if handraises are disabled', () => {
      const { store } = configureStore({
        initialState: {
          ...moderatorState,
          moderation: {
            forceMute: { type: ForceMuteType.Disabled, unrestrictedParticipants: [] },
            raiseHandsEnabled: false,
          },
        },
      });
      renderWithProviders(<MoreMenu anchorEl={document.createElement('div')} onClose={() => vi.fn()} open />, {
        store,
        provider: { snackbar: true, mui: true },
      });
      checkMenuItem('more-menu-turn-handraises-on');
      checkMenuItem('more-menu-turn-handraises-off', true);
    });
    it('shows the disable handraises option and does not show the enable handraises option, if handraises are enabled', () => {
      setup();
      checkMenuItem('more-menu-turn-handraises-on', true);
      checkMenuItem('more-menu-turn-handraises-off');
    });
    it('shows the disable microphones option and does not show the enable microphones option, if microphones are enabled', () => {
      setup();
      checkMenuItem('more-menu-disable-microphones');
      checkMenuItem('more-menu-enable-microphones', true);
    });
    it('shows the enable microphones option and does not show the disable microphones, if microphones are disabled', () => {
      const { store } = configureStore({
        initialState: {
          ...moderatorState,
          moderation: { forceMute: { type: ForceMuteType.Enabled, unrestrictedParticipants: [] } },
        },
      });
      renderWithProviders(<MoreMenu anchorEl={document.createElement('div')} onClose={() => vi.fn()} open />, {
        store,
        provider: { snackbar: true, mui: true },
      });
      checkMenuItem('more-menu-disable-microphones', true);
      checkMenuItem('more-menu-enable-microphones');
    });

    it('shows the disable waiting room option and does not show the enable waiting room option, if the waiting room is active', () => {
      const { store } = configureStore({
        initialState: {
          user: { role: Role.Moderator },
          room: { isOwnedByCurrentUser: true, waitingRoomEnabled: true },
        },
      });
      renderWithProviders(<MoreMenu anchorEl={document.createElement('div')} onClose={() => vi.fn()} open />, {
        store,
        provider: { snackbar: true, mui: true },
      });
      checkMenuItem('more-menu-enable-waiting-room', true);
      checkMenuItem('more-menu-disable-waiting-room');
    });

    it('shows the meeting notes export option, if the meeting notes module is enabled', () => {
      const { store } = configureStore({
        initialState: { ...moderatorState, config: { tariff: { modules: { meetingReport: { features: [] } } } } },
      });
      renderWithProviders(<MoreMenu anchorEl={document.createElement('div')} onClose={() => vi.fn()} open />, {
        store,
        provider: { snackbar: true, mui: true },
      });
      checkMenuItem('more-menu-export-attendance-report');
    });
  });

  describe('if the user is a moderator and not a room owner', () => {
    const moderatorState = { user: { role: Role.Moderator }, room: { isOwnedByCurrentUser: false } };
    it('does not render invite guest options even if the guests allowed feature is enabled', () => {
      const { store: storeWithGuestsAllowed } = configureStore({
        initialState: {
          ...moderatorState,
          config: { tariff: { modules: { core: { features: ['guests_allowed'] } } } },
        },
      });
      renderWithProviders(<MoreMenu anchorEl={document.createElement('div')} onClose={() => vi.fn()} open />, {
        store: storeWithGuestsAllowed,
        provider: { snackbar: true, mui: true },
      });
      expect(screen.queryByRole('menuitem', { name: 'more-menu-create-invite' })).not.toBeInTheDocument();
    });
  });

  describe('additional development options', () => {
    beforeEach(() => {
      window.localStorage.setItem('devMode', 'true');
    });

    it('shows success notification when show test info option is clicked', () => {
      renderWithProviders(<MoreMenu open anchorEl={document.createElement('div')} onClose={vi.fn()} />, {
        store,
        provider: { mui: true, snackbar: true },
      });
      const spyNotificationsSuccess = vi.spyOn(notifications, 'success');

      fireEvent.click(screen.getByText('Show Test Info'));

      expect(spyNotificationsSuccess).toHaveBeenCalledWith('You just triggered this notification. Success!');
    });

    it('shows error notification when show test error option is clicked', () => {
      renderWithProviders(<MoreMenu open anchorEl={document.createElement('div')} onClose={vi.fn()} />, {
        store,
        provider: { mui: true, snackbar: true },
      });
      const spyNotificationsError = vi.spyOn(notifications, 'error');

      fireEvent.click(screen.getByText('Show Test Error'));

      expect(spyNotificationsError).toHaveBeenCalledWith('Test error context: Error: Test Error');
    });
    it('shows training participation button if module trainingParticipationReport is defined', async () => {
      const { store: storeWithModules } = configureStore({
        initialState: {
          user: { role: Role.Moderator },
          room: { isOwnedByCurrentUser: true },
          config: { tariff: { modules: { trainingParticipationReport: { features: [] } } } },
        },
      });

      renderWithProviders(<MoreMenu anchorEl={document.createElement('div')} onClose={() => vi.fn()} open />, {
        store: storeWithModules,
        provider: { snackbar: true, mui: true },
      });

      expect(await screen.findByText('Test training participation report on')).toBeInTheDocument();
    });
  });
});
