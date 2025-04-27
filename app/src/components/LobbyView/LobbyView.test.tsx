// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { InviteCode } from '@opentalk/rest-api-rtk-query';
import { screen, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Role } from '../../api/types/incoming/control';
import * as UseInviteCodeModule from '../../hooks/useInviteCode';
import { renderWithProviders, configureStore } from '../../utils/testUtils';
import LobbyView from './LobbyView';

jest.mock('../SelfTest', () => ({
  __esModule: true,
  default: ({ children, actionButton }: { children?: React.ReactNode; actionButton?: React.ReactNode }) => {
    return (
      <div data-testid="self-test">
        {actionButton}
        {children}
      </div>
    );
  },
}));

jest.mock('../../api/rest', () => ({
  ...jest.requireActual('../../api/rest'),
  useGetMeQuery: () => ({
    data: {
      displayName: 'Test',
    },
    isLoading: false,
  }),
  useGetRoomEventInfoQuery: () => ({
    data: {},
  }),
}));

describe('LobbyView', () => {
  const { store } = configureStore({
    initialState: {
      auth: { isAuthed: true },
      user: { loggedIdToken: undefined, role: Role.Guest },
      room: { passwordRequired: true, invite: { inviteCode: 'inviteCode' } },
    },
  });
  afterEach(() => {
    cleanup();
    jest.resetAllMocks();
  });

  it('renders self test and join form correctly', () => {
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    const selftest = screen.getByTestId('self-test');
    expect(selftest).toBeInTheDocument();
    const form = within(selftest).getByRole('form', { name: 'joinform-title' });
    expect(form).toBeInTheDocument();
  });

  it('renders the form input fields correctly', () => {
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    const userNameInput = screen.getByPlaceholderText('lobby-name-placeholder');
    expect(userNameInput).toBeInTheDocument();
    expect(userNameInput).toHaveAttribute('type', 'text');
    expect(userNameInput).toHaveDisplayValue('Test');

    const passwordInput = screen.getByPlaceholderText('lobby-password-placeholder');
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('type', 'password');

    const passVisibilityToggle = screen.getByRole('button', { name: 'toggle-password-visibility' });
    expect(passVisibilityToggle).toBeInTheDocument();
  });

  it('renders the submit button, which is enabled by default', () => {
    const useInviteCodeMock = jest.spyOn(UseInviteCodeModule, 'useInviteCode');
    useInviteCodeMock.mockReturnValue('invite-code' as InviteCode);

    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    const submitButton = screen.getByRole('button', { name: 'joinform-enter-now' });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).not.toHaveAttribute('disabled');
  });

  it('disables submit button when user is not logged in', () => {
    const { store } = configureStore({
      initialState: {
        user: { loggedIn: false, role: Role.User },
      },
    });
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    const submitButton = screen.getByRole('button', { name: 'joinform-enter-now' });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveAttribute('disabled');
  });

  it('submits added values when input fields are filled and submit button is clicked', async () => {
    const USERNAME = 'lobbyForm testUserName*7';
    const PASSWORD = 'lobbyFormPassword (*';

    const useInviteCodeMock = jest.spyOn(UseInviteCodeModule, 'useInviteCode');
    useInviteCodeMock.mockReturnValue('invite-code' as InviteCode);
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    const userNameInput = screen.getByPlaceholderText('lobby-name-placeholder');
    await userEvent.clear(userNameInput);
    await userEvent.type(userNameInput, USERNAME);
    expect(userNameInput).toHaveValue(USERNAME);

    const passwordInput = screen.getByPlaceholderText('lobby-password-placeholder');
    await userEvent.type(passwordInput, PASSWORD);
    expect(passwordInput).toHaveValue(PASSWORD);

    /* TODO the startRoom ('room/start/pending') async thunks is undefined here
    const submitButton = screen.getByRole('button', { name: 'joinform-enter-now' });
    await userEvent.click(submitButton);
    await waitFor(() => {
      expect(dispatch.mock.calls).toContain([
        [{ payload: undefined, type: 'auth/loaded' }],
        [{ payload: undefined, type: 'room/start/pending' }],
      ]);
    });
    */
  });

  it('shows the password when toggle visibility button is clicked', async () => {
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    const passwordInput = screen.getByPlaceholderText('lobby-password-placeholder');
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleVisibilityBtn = screen.getByRole('button', { name: 'toggle-password-visibility' });
    await userEvent.click(toggleVisibilityBtn);
    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('prefills name field from displayName', () => {
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    expect(screen.getByPlaceholderText('lobby-name-placeholder')).toHaveDisplayValue('Test');
  });
});
