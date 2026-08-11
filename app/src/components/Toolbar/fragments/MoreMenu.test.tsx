// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
// Switch off the rule, as it doesn't recognize assertion in the utility helper function
// Maybe it's a bug or maybe it's not a good practice to use this kind of helper function
/* eslint-disable vitest/expect-expect */
import { CoreFeatures, BackendModules, TranscriptionFeatures } from '@opentalk/rest-api-rtk-query';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TranscriptionStatus } from '../../../api/types/incoming/transcription';
import { disableSelfRename, enableSelfRename } from '../../../api/types/outgoing/moderation';
import { notifications } from '../../../commonComponents';
import { setGuestAccessEnabled } from '../../../store/slices/moderationSlice';
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

describe('MoreMenu', () => {
  const { store } = configureStore();

  const checkMenuItem = (name: string, options?: { disabled?: boolean; falsify?: boolean }) => {
    if (options?.falsify) {
      expect(screen.queryByRole('menuitem', { name })).not.toBeInTheDocument();
    } else {
      expect(screen.getByRole('menuitem', { name })).toBeInTheDocument();
      if (options?.disabled) {
        expect(screen.getByRole('menuitem', { name })).toHaveAttribute('aria-disabled', 'true');
      }
    }
  };

  it('renders MoreMenuButton component', () => {
    renderWithProviders(<MenuButton />, { store, provider: { snackbar: true, mui: true } });

    expect(screen.getByTestId('toolbarMenuButton')).toBeInTheDocument();
    expect(screen.queryByTestId('moreMenu')).not.toBeInTheDocument();
  });

  it('renders moreMenu after clicking on MoreMenuButton', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MenuButton />, { store, provider: { snackbar: true, mui: true } });
    const button = screen.getByTestId('toolbarMenuButton');
    expect(button).toBeInTheDocument();

    await user.click(button);

    expect(screen.getByTestId('moreMenu')).toBeInTheDocument();
  });
  describe('if the user is a moderator and room owner', () => {
    const setup = () =>
      renderWithProviders(<MoreMenu anchorEl={document.createElement('div')} onClose={() => vi.fn()} open />, {
        store,
        provider: { snackbar: true, mui: true },
      });

    const moderatorState = { user: { role: Role.Moderator }, room: { isOwnedByCurrentUser: true } };
    const { store } = configureStore({
      initialState: {
        ...moderatorState,
        config: {
          provider: {
            accountManagementUrl: 'https://account.opentalk.eu',
          },
          enabledModules: {},
        },
      },
    });

    describe('invite guest options', () => {
      it('does not render invite guest options if the guests allowed feature is not enabled', () => {
        setup();
        expect(screen.queryByRole('menuitem', { name: 'more-menu-create-invite' })).not.toBeInTheDocument();
      });
      it('renders invite guest options if the guests allowed feature is enabled', () => {
        const { store: storeWithGuestsAllowed } = configureStore({
          initialState: {
            ...moderatorState,
            config: {
              provider: {
                accountManagementUrl: 'https://account.opentalk.eu',
              },
              enabledModules: { [BackendModules.Core]: [CoreFeatures.GuestsAllowed] },
            },
          },
        });
        renderWithProviders(<MoreMenu anchorEl={document.createElement('div')} onClose={() => vi.fn()} open />, {
          store: storeWithGuestsAllowed,
          provider: { snackbar: true, mui: true },
        });
        expect(screen.getByRole('menuitem', { name: 'more-menu-create-invite' })).toBeInTheDocument();
      });
      it('renders the invite guest option disabled when guest access is turned off', () => {
        const { store: storeWithGuestAccessOff } = configureStore({
          initialState: {
            ...moderatorState,
            config: {
              provider: {
                accountManagementUrl: 'https://account.opentalk.eu',
              },
              enabledModules: { [BackendModules.Core]: [CoreFeatures.GuestsAllowed] },
            },
          },
        });
        storeWithGuestAccessOff.dispatch(setGuestAccessEnabled(false));
        renderWithProviders(<MoreMenu anchorEl={document.createElement('div')} onClose={() => vi.fn()} open />, {
          store: storeWithGuestAccessOff,
          provider: { snackbar: true, mui: true },
        });
        const inviteGuest = screen.getByRole('menuitem', { name: 'more-menu-create-invite' });
        expect(inviteGuest).toBeInTheDocument();
        expect(inviteGuest).toHaveAttribute('aria-disabled', 'true');
      });
      it('renders invite guest dialog and it"s closed by default', () => {
        setup();
        expect(screen.getByTestId('invite-guest-dialog')).toBeInTheDocument();
        expect(screen.queryByText('Invite Guest Open')).not.toBeInTheDocument();
      });
      it('opens invite guest dialog when user clicks on invite guest menu option', async () => {
        // eslint-disable-next-line testing-library/render-result-naming-convention
        const user = userEvent.setup();
        const { store: storeWithGuestsAllowed } = configureStore({
          initialState: {
            ...moderatorState,
            config: {
              provider: {
                accountManagementUrl: 'https://account.opentalk.eu',
              },
              enabledModules: { [BackendModules.Core]: [CoreFeatures.GuestsAllowed] },
            },
          },
        });
        renderWithProviders(<MoreMenu anchorEl={document.createElement('div')} onClose={() => vi.fn()} open />, {
          store: storeWithGuestsAllowed,
          provider: { snackbar: true, mui: true },
        });
        const inviteGuest = screen.getByRole('menuitem', { name: 'more-menu-create-invite' });
        await user.click(inviteGuest);
        expect(screen.getByText('Invite Guest Open')).toBeInTheDocument();
      });
    });

    it('shows the manage waiting room option, and the enable/disable items are not present directly', () => {
      setup();
      checkMenuItem('more-menu-manage-waiting-room');
      checkMenuItem('more-menu-enable-waiting-room', { falsify: true });
      checkMenuItem('more-menu-disable-waiting-room', { falsify: true });
    });

    it('does not show meeting notes export option, if the meeting notes module is disabled', () => {
      setup();
      checkMenuItem('more-menu-export-attendance-report', { falsify: true });
    });

    describe('transcription options', () => {
      describe('if the transcription module is enabled', () => {
        const config = {
          provider: {
            accountManagementUrl: 'https://account.opentalk.eu',
          },
          enabledModules: { [BackendModules.Transcription]: [TranscriptionFeatures.Transcription] },
        };
        it('shows the subtitle settings option', () => {
          const initialState = {
            ...moderatorState,
            transcription: { status: TranscriptionStatus.Inactive, segments: [], showSubtitles: false },
            config,
          };
          const { store } = configureStore({ initialState });
          renderWithProviders(<MoreMenu anchorEl={document.createElement('div')} onClose={() => vi.fn()} open />, {
            store,
            provider: { mui: true, snackbar: true },
          });
          checkMenuItem('more-menu-subtitle-settings');
        });
        it('opens the subtitle settings when the option is clicked', async () => {
          // eslint-disable-next-line testing-library/render-result-naming-convention
          const user = userEvent.setup();
          const initialState = {
            ...moderatorState,
            transcription: { status: TranscriptionStatus.Inactive, segments: [], showSubtitles: false },
            config,
          };
          const { store } = configureStore({ initialState });
          renderWithProviders(<MoreMenu anchorEl={document.createElement('div')} onClose={() => vi.fn()} open />, {
            store,
            provider: { mui: true, snackbar: true },
          });
          const subtitleSettingsButton = screen.getByRole('menuitem', { name: 'more-menu-subtitle-settings' });
          await user.click(subtitleSettingsButton);
          expect(screen.getByText('subtitle-settings-dialog-title')).toBeInTheDocument();
        });
      });
      describe('if the transcription module is disabled', () => {
        it('does not show the subtitle settings option', () => {
          const { store } = configureStore({
            initialState: {
              ...moderatorState,
              config: { provider: { accountManagementUrl: 'https://account.opentalk.eu' }, enabledModules: {} },
            },
          });
          renderWithProviders(<MoreMenu anchorEl={document.createElement('div')} onClose={() => vi.fn()} open />, {
            store,
            provider: { mui: true, snackbar: true },
          });
          checkMenuItem('more-menu-subtitle-settings', { falsify: true });
        });
      });
    });

    describe('training participation report options', () => {
      describe('if the module is enabled', () => {
        const config = {
          provider: {
            accountManagementUrl: 'https://account.opentalk.eu',
          },
          enabledModules: { [BackendModules.TrainingParticipationReport]: [] },
        };

        it('shows the enable training participation logging button, if the logging is disabled, and does not show the disable button', () => {
          const { store: storeWithModules } = configureStore({ initialState: { ...moderatorState, config } });
          renderWithProviders(<MoreMenu anchorEl={document.createElement('div')} onClose={() => vi.fn()} open />, {
            store: storeWithModules,
            provider: { mui: true, snackbar: true },
          });
          checkMenuItem('training-participation-logging-enable-button');
          checkMenuItem('training-participation-logging-disable-button', { falsify: true });
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
          checkMenuItem('training-participation-logging-enable-button', { falsify: true });
          checkMenuItem('training-participation-logging-disable-button');
        });
      });
      describe('if the module is disabled', () => {
        it('does not show training participation options', () => {
          checkMenuItem('training-participation-logging-enable-button', { falsify: true });
          checkMenuItem('training-participation-logging-disable-button', { falsify: true });
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
      checkMenuItem('more-menu-turn-handraises-off', { falsify: true });
    });
    it('shows the disable handraises option and does not show the enable handraises option, if handraises are enabled', () => {
      setup();
      checkMenuItem('more-menu-turn-handraises-on', { falsify: true });
      checkMenuItem('more-menu-turn-handraises-off');
    });
    it('shows the disable microphones option and does not show the enable microphones option, if microphones are enabled', () => {
      setup();
      checkMenuItem('more-menu-disable-microphones');
      checkMenuItem('more-menu-enable-microphones', { falsify: true });
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
      checkMenuItem('more-menu-disable-microphones', { falsify: true });
      checkMenuItem('more-menu-enable-microphones');
    });

    it('shows the manage waiting room option when the waiting room is active', () => {
      const { store } = configureStore({
        initialState: {
          user: { role: Role.Moderator },
          room: { isOwnedByCurrentUser: true },
        },
      });
      renderWithProviders(<MoreMenu anchorEl={document.createElement('div')} onClose={() => vi.fn()} open />, {
        store,
        provider: { snackbar: true, mui: true },
      });
      checkMenuItem('more-menu-manage-waiting-room');
      checkMenuItem('more-menu-enable-waiting-room', { falsify: true });
      checkMenuItem('more-menu-disable-waiting-room', { falsify: true });
    });

    it('shows the meeting notes export option, if the meeting notes module is enabled', () => {
      const { store } = configureStore({
        initialState: {
          ...moderatorState,
          config: {
            provider: {
              accountManagementUrl: 'https://account.opentalk.eu',
            },
            enabledModules: { [BackendModules.MeetingReport]: [] },
          },
        },
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
          config: {
            provider: {
              accountManagementUrl: 'https://account.opentalk.eu',
            },
            enabledModules: { [BackendModules.Core]: [CoreFeatures.GuestsAllowed] },
          },
        },
      });
      renderWithProviders(<MoreMenu anchorEl={document.createElement('div')} onClose={() => vi.fn()} open />, {
        store: storeWithGuestsAllowed,
        provider: { snackbar: true, mui: true },
      });
      expect(screen.queryByRole('menuitem', { name: 'more-menu-create-invite' })).not.toBeInTheDocument();
    });
  });

  describe('if the user is not a moderator', () => {
    const { store } = configureStore({
      initialState: {
        user: { role: Role.User },
        room: { isOwnedByCurrentUser: false },
      },
    });
    describe('transcription options', () => {
      it('does not show the subtitle settings option', () => {
        renderWithProviders(<MoreMenu anchorEl={document.createElement('div')} onClose={() => vi.fn()} open />, {
          store,
          provider: { mui: true, snackbar: true },
        });
        checkMenuItem('more-menu-subtitle-settings', { falsify: true });
      });
    });
  });
  describe('for every type of user', () => {
    const userState = { user: { role: Role.User }, room: { isOwnedByCurrentUser: false } };
    describe('transcription options', () => {
      describe('if the transcription module is enabled', () => {
        const config = {
          provider: {
            accountManagementUrl: 'https://account.opentalk.eu',
          },
          enabledModules: { [BackendModules.Transcription]: [TranscriptionFeatures.Transcription] },
        };
        describe('if the transcription service is inactive', () => {
          const initialState = {
            ...userState,
            transcription: { status: TranscriptionStatus.Inactive, segments: [], showSubtitles: false },
            config,
          };
          it('shows the show subtitles option as disabled', () => {
            const { store } = configureStore({ initialState });
            renderWithProviders(<MoreMenu anchorEl={document.createElement('div')} onClose={() => vi.fn()} open />, {
              store,
              provider: { mui: true, snackbar: true },
            });
            checkMenuItem('more-menu-show-subtitles', { disabled: true });
          });
        });
        describe('if the transcription service is active', () => {
          const initialState = {
            ...userState,
            transcription: { status: TranscriptionStatus.Running, segments: [], showSubtitles: false },
            config,
          };
          it('shows the show subtitles option as enabled', () => {
            const { store } = configureStore({ initialState });
            renderWithProviders(<MoreMenu anchorEl={document.createElement('div')} onClose={() => vi.fn()} open />, {
              store,
              provider: { mui: true, snackbar: true },
            });
            checkMenuItem('more-menu-show-subtitles');
          });
        });
        describe('if the subtitles are shown', () => {
          const initialState = {
            ...userState,
            transcription: { status: TranscriptionStatus.Running, segments: [], showSubtitles: true },
            config,
          };
          it('shows the hide subtitles option and not the show subtitles option', () => {
            const { store } = configureStore({ initialState });
            renderWithProviders(<MoreMenu anchorEl={document.createElement('div')} onClose={() => vi.fn()} open />, {
              store,
              provider: { mui: true, snackbar: true },
            });
            checkMenuItem('more-menu-show-subtitles', { falsify: true });
            checkMenuItem('more-menu-hide-subtitles');
          });
        });
      });
      describe('if the transcription module is disabled', () => {
        const initialState = {
          ...userState,
          config: { provider: { accountManagementUrl: 'https://account.opentalk.eu' }, enabledModules: {} },
        };
        it('does not show the show subtitles option', () => {
          const { store } = configureStore({ initialState });
          renderWithProviders(<MoreMenu anchorEl={document.createElement('div')} onClose={() => vi.fn()} open />, {
            store,
            provider: { mui: true, snackbar: true },
          });
          checkMenuItem('more-menu-show-subtitles', { falsify: true });
        });
      });
    });
  });

  describe('additional development options', () => {
    beforeEach(() => {
      window.localStorage.setItem('devMode', 'true');
    });

    it('shows success notification when show test info option is clicked', async () => {
      // eslint-disable-next-line testing-library/render-result-naming-convention
      const user = userEvent.setup();
      renderWithProviders(<MoreMenu open anchorEl={document.createElement('div')} onClose={vi.fn()} />, {
        store,
        provider: { mui: true, snackbar: true },
      });
      const spyNotificationsSuccess = vi.spyOn(notifications, 'success');

      await user.click(screen.getByText('Show Test Info'));

      expect(spyNotificationsSuccess).toHaveBeenCalledExactlyOnceWith('You just triggered this notification. Success!');
    });

    it('shows error notification when show test error option is clicked', async () => {
      // eslint-disable-next-line testing-library/render-result-naming-convention
      const user = userEvent.setup();
      renderWithProviders(<MoreMenu open anchorEl={document.createElement('div')} onClose={vi.fn()} />, {
        store,
        provider: { mui: true, snackbar: true },
      });
      const spyNotificationsError = vi.spyOn(notifications, 'error');

      await user.click(screen.getByText('Show Test Error'));

      expect(spyNotificationsError).toHaveBeenCalledExactlyOnceWith('Test error context: Error: Test Error');
    });
    it('shows training participation button if module trainingParticipationReport is defined', async () => {
      const { store: storeWithModules } = configureStore({
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
        store: storeWithModules,
        provider: { snackbar: true, mui: true },
      });

      expect(await screen.findByText('Test training participation report on')).toBeInTheDocument();
    });
  });

  describe('self-rename toggle', () => {
    const moderatorRoomOwnerState = { user: { role: Role.Moderator }, room: { isOwnedByCurrentUser: true } };

    it('shows the enable renaming option and dispatches enableSelfRename when self-rename is disabled', async () => {
      // eslint-disable-next-line testing-library/render-result-naming-convention
      const user = userEvent.setup();
      const { store, dispatchSpy } = configureStore({ initialState: moderatorRoomOwnerState });
      renderWithProviders(<MoreMenu anchorEl={document.createElement('div')} onClose={() => vi.fn()} open />, {
        store,
        provider: { snackbar: true, mui: true },
      });

      const toggle = screen.getByRole('menuitem', { name: 'more-menu-disable-display-name-change-restrictions' });
      expect(toggle).toBeInTheDocument();
      expect(
        screen.queryByRole('menuitem', { name: 'more-menu-enable-display-name-change-restrictions' })
      ).not.toBeInTheDocument();

      await user.click(toggle);

      expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: enableSelfRename.action.type }));
      expect(dispatchSpy).not.toHaveBeenCalledWith(expect.objectContaining({ type: disableSelfRename.action.type }));
    });

    it('shows the disable renaming option and dispatches disableSelfRename when self-rename is enabled', async () => {
      // eslint-disable-next-line testing-library/render-result-naming-convention
      const user = userEvent.setup();
      const { store, dispatchSpy } = configureStore({
        initialState: {
          ...moderatorRoomOwnerState,
          moderation: {
            forceMute: { type: ForceMuteType.Disabled, unrestrictedParticipants: [] },
            selfRenameEnabled: true,
          },
        },
      });
      renderWithProviders(<MoreMenu anchorEl={document.createElement('div')} onClose={() => vi.fn()} open />, {
        store,
        provider: { snackbar: true, mui: true },
      });

      const toggle = screen.getByRole('menuitem', { name: 'more-menu-enable-display-name-change-restrictions' });
      expect(toggle).toBeInTheDocument();
      expect(
        screen.queryByRole('menuitem', { name: 'more-menu-disable-display-name-change-restrictions' })
      ).not.toBeInTheDocument();

      await user.click(toggle);

      expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: disableSelfRename.action.type }));
      expect(dispatchSpy).not.toHaveBeenCalledWith(expect.objectContaining({ type: enableSelfRename.action.type }));
    });
  });
});
