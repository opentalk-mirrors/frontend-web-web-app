// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { InviteCode } from '@opentalk/rest-api-rtk-query';
import { screen, fireEvent, cleanup } from '@testing-library/react';
import { PropsWithChildren } from 'react';

import { Role } from '../../api/types/incoming/control';
import * as UseInviteCodeModule from '../../hooks/useInviteCode';
import { renderWithProviders, configureStore, mockedParticipant } from '../../utils/testUtils';
import LobbyView from './LobbyView';

jest.mock('../../templates/fragments/BrowserCompatibilityInfo', () => ({
  __esModule: true,
  default: ({ children }: PropsWithChildren) => {
    return <div>{children}</div>;
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
}));

jest.mock('../../hooks/useFullscreenContext.ts', () => ({
  useFullscreenContext: () => ({
    active: false,
  }),
}));

jest.mock('@livekit/components-react', () => ({
  useMaybeRoomContext: () => ({ localParticipant: mockedParticipant(0) }),
  useMediaDeviceSelect: () => ({
    devices: [
      { deviceId: 'xxxxx', groupId: 'xxxxxx', kind: 'audioinput', label: 'audio' },
      { deviceId: 'xxxx1', groupId: 'xxxxx1', kind: 'videoinput', label: 'video' },
    ],
  }),
}));

describe('LobbyForm', () => {
  const { store /*, dispatch*/ } = configureStore({
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

  test('renders self test component', () => {
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    expect(screen.getByTestId('selfTest')).toBeInTheDocument();
  });

  test('render LobbyForm component without crashing for authed user', () => {
    //As we now get the invite code in components from the query params we need to mock a value for it.
    const useInviteCodeMock = jest.spyOn(UseInviteCodeModule, 'useInviteCode');
    useInviteCodeMock.mockReturnValue('invite-code' as InviteCode);

    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    const userNameInput = screen.getByPlaceholderText('lobby-name-placeholder');
    expect(userNameInput).toBeInTheDocument();
    expect(userNameInput).toHaveAttribute('type', 'text');
    expect(userNameInput).toHaveDisplayValue('Test');

    const passwordInput = screen.getByPlaceholderText('lobby-password-placeholder');
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('type', 'password');

    const passVisibilityToggle = screen.getByRole('button', { name: /toggle-password-visibility/i });
    expect(passVisibilityToggle).toBeInTheDocument();

    const submitButton = screen.getByRole('button', { name: /joinform-enter-now/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).not.toHaveAttribute('disabled');
  });

  test('submit button is disabled if user is not logged in', () => {
    const { store } = configureStore({
      initialState: {
        user: { loggedIn: false, role: Role.User },
      },
    });
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    const submitButton = screen.getByRole('button', { name: /joinform-enter-now/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveAttribute('disabled');
  });

  test('adding values to input fileds and click on submit should submit added values', () => {
    const USERNAME = 'lobbyForm testUserName*7';
    const PASSWORD = 'lobbyFormPassword (*';
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    const userNameInput = screen.getByPlaceholderText('lobby-name-placeholder');
    expect(userNameInput).toBeInTheDocument();

    fireEvent.change(userNameInput, { target: { value: USERNAME } });

    expect(userNameInput).toHaveValue(USERNAME);

    const passwordInput = screen.getByPlaceholderText('lobby-password-placeholder');
    expect(passwordInput).toBeInTheDocument();

    fireEvent.change(passwordInput, { target: { value: PASSWORD } });

    expect(passwordInput).toHaveValue(PASSWORD);

    const submitButton = screen.getByRole('button', { name: /joinform-enter-now/i });
    expect(submitButton).toBeInTheDocument();

    /* TODO the startRoom ('room/start/pending') async thunks is undefined here
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(dispatch.mock.calls).toContain([
        [{ payload: undefined, type: 'auth/loaded' }],
        [{ payload: undefined, type: 'room/start/pending' }],
      ]);
    });
    */
  });

  test('click on toggle visibility button should change input type=text', () => {
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    const passwordInput = screen.getByPlaceholderText('lobby-password-placeholder');
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleVisibilityBtn = screen.getByRole('button', { name: /toggle-password-visibility/i });
    expect(toggleVisibilityBtn).toBeInTheDocument();

    fireEvent.click(toggleVisibilityBtn);

    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  test('name field prefilled from displayName', () => {
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    expect(screen.getByPlaceholderText('lobby-name-placeholder')).toHaveDisplayValue('Test');
  });
});
