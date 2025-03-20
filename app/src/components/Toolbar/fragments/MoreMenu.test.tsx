// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, fireEvent } from '@testing-library/react';

import { ForceMuteType, Role } from '../../../types';
import { renderWithProviders, configureStore } from '../../../utils/testUtils';
import MenuButton from './MoreButton';
import MoreMenu from './MoreMenu';

describe('<MoreButton />', () => {
  const { store } = configureStore();

  const checkMenuItem = (name: string, falsify?: boolean) => {
    if (falsify) {
      expect(screen.queryByRole('menuitem', { name })).not.toBeInTheDocument();
    } else {
      expect(screen.getByRole('menuitem', { name })).toBeInTheDocument();
    }
  };

  test('render MoreMenuButton component', () => {
    renderWithProviders(<MenuButton />, { store, provider: { snackbar: true } });

    expect(screen.getByTestId('toolbarMenuButton')).toBeInTheDocument();
    expect(screen.queryByTestId('moreMenu')).not.toBeInTheDocument();
  });

  test('render moreMenu after clicking on MoreMenuButton', () => {
    renderWithProviders(<MenuButton />, { store, provider: { snackbar: true } });
    const button = screen.getByTestId('toolbarMenuButton');
    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    expect(screen.getByTestId('moreMenu')).toBeInTheDocument();
  });
  describe('if the user is a moderator and room owner', () => {
    const moderatorState = { user: { role: Role.Moderator }, room: { isOwnedByCurrentUser: true } };

    const { store } = configureStore({ initialState: { ...moderatorState } });
    beforeEach(() => {
      renderWithProviders(<MoreMenu anchorEl={document.createElement('div')} onClose={() => jest.fn()} open />, {
        store,
        provider: { snackbar: true },
      });
    });

    test('if the waiting room is inactive the enable waiting room option should be visible and the disable waiting room option should not be visible', () => {
      checkMenuItem('more-menu-enable-waiting-room');
      checkMenuItem('more-menu-disable-waiting-room', true);
    });

    test('the meeting notes export option should not be visible if the meeting notes module is disabled', () => {
      checkMenuItem('more-menu-export-attendance-report', true);
    });
    describe('training participation report options', () => {
      describe('if the module is enabled', () => {
        const config = { tariff: { modules: { trainingParticipationReport: { features: [] } } } };

        test('the enable training participation logging button should be visible if the logging is disabled, and the disable button should not be visible', () => {
          const { store: storeWithModules } = configureStore({ initialState: { ...moderatorState, config } });
          renderWithProviders(<MoreMenu anchorEl={document.createElement('div')} onClose={() => jest.fn()} open />, {
            store: storeWithModules,
            provider: { mui: true, snackbar: true },
          });
          checkMenuItem('training-participation-logging-enable-button');
          checkMenuItem('training-participation-logging-disable-button', true);
        });
        test('the disable training participation logging button should be visible if the logging is enabled, and the enable button should not be visible', () => {
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
          renderWithProviders(<MoreMenu anchorEl={document.createElement('div')} onClose={() => jest.fn()} open />, {
            store: storeWithModules,
            provider: { mui: true, snackbar: true },
          });
          checkMenuItem('training-participation-logging-enable-button', true);
          checkMenuItem('training-participation-logging-disable-button');
        });
      });
      describe('if the module is disabled', () => {
        test('no training participation options should be visible', () => {
          checkMenuItem('training-participation-logging-enable-button', true);
          checkMenuItem('training-participation-logging-disable-button', true);
        });
      });
    });
    test('if handraises are disabled the enable handraises option should be visible and the disable handraises option should not be visible', () => {
      const { store } = configureStore({
        initialState: {
          ...moderatorState,
          moderation: {
            forceMute: { type: ForceMuteType.Disabled, unrestrictedParticipants: [] },
            raiseHandsEnabled: false,
          },
        },
      });
      renderWithProviders(<MoreMenu anchorEl={document.createElement('div')} onClose={() => jest.fn()} open />, {
        store,
        provider: { snackbar: true },
      });
      checkMenuItem('more-menu-turn-handraises-on');
      checkMenuItem('more-menu-turn-handraises-off', true);
    });
    test('if handraises are enabled the disable handraises option should be visible and the enable handraises option should not be visible', () => {
      checkMenuItem('more-menu-turn-handraises-on', true);
      checkMenuItem('more-menu-turn-handraises-off');
    });
    test('if microphones are enabled the disable microphones option should be visible and the enable microphones option should not be visible', () => {
      checkMenuItem('more-menu-disable-microphones');
      checkMenuItem('more-menu-enable-microphones', true);
    });
    test('if microphones are disabled the enable microphones option should be visible and the disable microphones option should not be visible', () => {
      const { store } = configureStore({
        initialState: {
          ...moderatorState,
          moderation: { forceMute: { type: ForceMuteType.Enabled, unrestrictedParticipants: [] } },
        },
      });
      renderWithProviders(<MoreMenu anchorEl={document.createElement('div')} onClose={() => jest.fn()} open />, {
        store,
        provider: { snackbar: true },
      });
      checkMenuItem('more-menu-disable-microphones', true);
      checkMenuItem('more-menu-enable-microphones');
    });

    test('if the waiting room is active the disable waiting room option should be visible and the enable waiting room option should not be visible', () => {
      const { store } = configureStore({
        initialState: {
          user: { role: Role.Moderator },
          room: { isOwnedByCurrentUser: true, waitingRoomEnabled: true },
        },
      });
      renderWithProviders(<MoreMenu anchorEl={document.createElement('div')} onClose={() => jest.fn()} open />, {
        store,
        provider: { snackbar: true },
      });
      checkMenuItem('more-menu-enable-waiting-room', true);
      checkMenuItem('more-menu-disable-waiting-room');
    });

    test('the meeting notes export option should be visible if the meeting notes module is enabled', () => {
      const { store } = configureStore({
        initialState: { ...moderatorState, config: { tariff: { modules: { meetingReport: { features: [] } } } } },
      });
      renderWithProviders(<MoreMenu anchorEl={document.createElement('div')} onClose={() => jest.fn()} open />, {
        store,
        provider: { snackbar: true },
      });
      checkMenuItem('more-menu-export-attendance-report');
    });
  });

  describe('additional development options', () => {
    beforeEach(() => {
      window.localStorage.setItem('devMode', 'true');
    });

    test('shows success notification when show test info option is clicked', () => {
      renderWithProviders(<MoreMenu open anchorEl={document.createElement('div')} onClose={jest.fn()} />, {
        store,
        provider: { mui: true, snackbar: true },
      });

      fireEvent.click(screen.getByText('Show Test Info'));

      const notificationMessage = screen.getByText('You just triggered this notification. Success!');

      expect(notificationMessage).toBeInTheDocument();
      expect(notificationMessage.parentElement).toHaveAttribute('role', 'alert');
      expect(notificationMessage.parentElement).toHaveClass('notistack-MuiContent-success');
    });

    test('shows error notification when show test error option is clicked', () => {
      renderWithProviders(<MoreMenu open anchorEl={document.createElement('div')} onClose={jest.fn()} />, {
        store,
        provider: { mui: true, snackbar: true },
      });

      fireEvent.click(screen.getByText('Show Test Error'));

      const notificationMessage = screen.getByText('Test error context: Error: Test Error');

      expect(notificationMessage).toBeInTheDocument();
      expect(notificationMessage.parentElement).toHaveAttribute('role', 'alert');
      expect(notificationMessage.parentElement).toHaveClass('notistack-MuiContent-error');
    });
    test('training participation button should be in MoreMenu when module trainingParticipationReport is defined', () => {
      const { store: storeWithModules } = configureStore({
        initialState: {
          user: { role: Role.Moderator },
          room: { isOwnedByCurrentUser: true },
          config: { tariff: { modules: { trainingParticipationReport: { features: [] } } } },
        },
      });

      renderWithProviders(<MoreMenu anchorEl={document.createElement('div')} onClose={() => jest.fn()} open />, {
        store: storeWithModules,
        provider: { mui: true, snackbar: true },
      });

      expect(screen.queryByText('Test training participation report on')).toBeInTheDocument();
    });
  });
});
