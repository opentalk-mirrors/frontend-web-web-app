// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { AuthContext } from '@opentalk/redux-oidc';
import { EventInfo } from '@opentalk/rest-api-rtk-query';
import { SerializedError } from '@reduxjs/toolkit';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import {
  enterRoom as enterRoomCommand,
  enterWaitingRoom as enterWaitingRoomCommand,
} from '../../api/types/outgoing/core';
import { SWITCH_ACCOUNT_STORAGE_KEY } from '../../hooks/useSwitchAccount';
import log from '../../logger';
import { ConnectionState } from '../../modules/WebRTC/ConferenceRoom';
import { startRoom } from '../../store/commonActions';
import { joinedLobby } from '../../store/slices/roomSlice';
import { setDisplayName } from '../../store/slices/userSlice';
import { ParticipationKind, Role } from '../../types/common';
import { navigateTo } from '../../utils/navigation';
import { renderWithProviders, configureStore } from '../../utils/testUtils';
import LobbyView from './LobbyView';

type RoomEventInfoResult =
  { data: Pick<EventInfo, 'passwordRequired' | 'isInvited'> } | { error: { status: number } | SerializedError };

const mocks = vi.hoisted((): { roomEventInfo: RoomEventInfoResult } => ({
  roomEventInfo: { data: { passwordRequired: false, isInvited: true } },
}));

vi.mock('../../utils/navigation', () => ({ navigateTo: vi.fn() }));

// The backend reports `isInvited: false` for users who are not logged in
const setRoomEventInfo = ({ passwordRequired = false, isInvited = true } = {}) => {
  mocks.roomEventInfo = { data: { passwordRequired, isInvited } };
};

vi.mock('../../templates/fragments/BrowserCompatibilityInfo', () => ({
  __esModule: true,
  default: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../SelfTest', () => ({
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

vi.mock('../../api/rest', async (importOriginal) => ({
  ...(await importOriginal()),
  useGetMeQuery: () => ({
    data: {
      displayName: 'Test',
    },
    isLoading: false,
  }),
  useGetRoomEventInfoQuery: () => mocks.roomEventInfo,
}));

vi.mock('../../store/commonActions', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../store/commonActions')>();
  const startRoomMock = vi.fn(() => () => {
    const promise = Promise.resolve({ conferenceContext: {} });
    (promise as unknown as { unwrap: () => Promise<unknown> }).unwrap = () =>
      Promise.resolve({ conferenceContext: {} });
    return promise;
  });
  return {
    ...actual,
    startRoom: Object.assign(startRoomMock, actual.startRoom),
  };
});

describe('LobbyView', () => {
  const { store } = configureStore({
    initialState: {
      auth: { state: 'authorized' },
      user: { loggedIdToken: undefined, role: Role.User, participantKind: ParticipationKind.Unregistered },
      room: { invite: {}, connectionState: ConnectionState.Lobby, canEnter: true },
    },
  });
  afterEach(() => {
    setRoomEventInfo();
    sessionStorage.clear();
    vi.resetAllMocks();
  });

  it('renders self test and join form correctly', () => {
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    const selftest = screen.getByTestId('self-test');
    expect(selftest).toBeInTheDocument();
    const form = within(selftest).getByRole('form', { name: 'joinform-title' });
    expect(form).toBeInTheDocument();
  });

  it('renders the display name input field correctly', () => {
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    const userNameInput = screen.getByPlaceholderText('lobby-name-placeholder');
    expect(userNameInput).toBeInTheDocument();
    expect(userNameInput).toHaveAttribute('type', 'text');
    expect(userNameInput).toHaveDisplayValue('Test');
  });

  it('renders the submit button, enabled once the lobby is reached', () => {
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    const submitButton = screen.getByRole('button', { name: 'joinform-enter-now' });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).not.toHaveAttribute('disabled');
  });

  it('disables submit button before the lobby is reached', () => {
    setRoomEventInfo({ isInvited: false });
    const { store } = configureStore({
      initialState: {
        user: { loggedIn: false, role: Role.User },
      },
    });
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    const submitButton = screen.getByRole('button', { name: 'joinform-join-as-guest' });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveAttribute('disabled');
  });

  it('prefills name field from displayName', () => {
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    expect(screen.getByPlaceholderText('lobby-name-placeholder')).toHaveDisplayValue('Test');
  });
});

describe('LobbyView connect-first WS lobby', () => {
  const setupLobbyStore = (roomOverrides: Record<string, unknown>) =>
    configureStore({
      initialState: {
        auth: { state: 'authorized' },
        user: { role: Role.User, participantKind: ParticipationKind.Unregistered },
        room: { invite: {}, ...roomOverrides },
      },
    });

  afterEach(() => {
    setRoomEventInfo();
    sessionStorage.clear();
    vi.resetAllMocks();
  });

  it('shows the "enter now" label when the participant may enter directly', () => {
    const { store } = setupLobbyStore({ connectionState: ConnectionState.Lobby, canEnter: true });
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    expect(screen.getByRole('button', { name: 'joinform-enter-now' })).toBeEnabled();
  });

  it('shows the "request to join" label when a moderator has to admit the participant', () => {
    const { store } = setupLobbyStore({ connectionState: ConnectionState.Lobby, canEnter: false });
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    expect(screen.getByRole('button', { name: 'joinform-request-to-join' })).toBeInTheDocument();
  });

  it('disables submit while the lobby has not been reached yet', () => {
    const { store } = setupLobbyStore({ connectionState: ConnectionState.Starting, canEnter: true });
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    expect(screen.getByRole('button', { name: 'joinform-enter-now' })).toBeDisabled();
  });

  it('locks the name field to the server-assigned display name', () => {
    const { store } = setupLobbyStore({
      connectionState: ConnectionState.Lobby,
      canEnter: true,
      lobbyDisplayName: 'Assigned',
    });
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    const input = screen.getByPlaceholderText('lobby-name-placeholder');
    expect(input).toHaveDisplayValue('Assigned');
    expect(input).toBeDisabled();
  });

  it('sends enter_room with the entered name when the participant may enter directly', async () => {
    const { store, dispatchSpy } = setupLobbyStore({ connectionState: ConnectionState.Lobby, canEnter: true });
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    const input = screen.getByPlaceholderText('lobby-name-placeholder');
    await user.clear(input);
    await user.type(input, 'Guest');
    await user.click(screen.getByRole('button', { name: 'joinform-enter-now' }));

    await waitFor(() => expect(dispatchSpy).toHaveBeenCalledWith(setDisplayName('Guest')));
    expect(dispatchSpy).toHaveBeenCalledWith(enterRoomCommand.action({ displayName: 'Guest' }));
  });

  it('sends enter_waiting_room with the entered name', async () => {
    const { store, dispatchSpy } = setupLobbyStore({ connectionState: ConnectionState.Lobby, canEnter: false });
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    const input = screen.getByPlaceholderText('lobby-name-placeholder');
    await user.clear(input);
    await user.type(input, 'Guest');
    await user.click(screen.getByRole('button', { name: 'joinform-request-to-join' }));

    await waitFor(() => expect(dispatchSpy).toHaveBeenCalledWith(setDisplayName('Guest')));
    expect(dispatchSpy).toHaveBeenCalledWith(enterWaitingRoomCommand.action({ displayName: 'Guest' }));
  });

  it('enters without a display name when the server already assigned one', async () => {
    const { store, dispatchSpy } = setupLobbyStore({
      connectionState: ConnectionState.Lobby,
      canEnter: true,
      lobbyDisplayName: 'Assigned',
    });
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    await user.click(screen.getByRole('button', { name: 'joinform-enter-now' }));

    await waitFor(() => expect(dispatchSpy).toHaveBeenCalledWith(enterRoomCommand.action({ displayName: undefined })));
    expect(dispatchSpy).not.toHaveBeenCalledWith(setDisplayName('Assigned'));
  });

  it('requests to join without a display name when the server already assigned one', async () => {
    const { store, dispatchSpy } = setupLobbyStore({
      connectionState: ConnectionState.Lobby,
      canEnter: false,
      lobbyDisplayName: 'Assigned',
    });
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    await user.click(screen.getByRole('button', { name: 'joinform-request-to-join' }));

    await waitFor(() =>
      expect(dispatchSpy).toHaveBeenCalledWith(enterWaitingRoomCommand.action({ displayName: undefined }))
    );
  });

  it('opens the connection automatically on refresh, when no password is required', async () => {
    const { store } = setupLobbyStore({ connectionState: ConnectionState.Setup });
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    await waitFor(() => expect(startRoom).toHaveBeenCalled());
  });

  it('opens the connection automatically for after hang up from the meeting, when no password is required', async () => {
    const { store } = setupLobbyStore({ connectionState: ConnectionState.Left });
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    await waitFor(() => expect(startRoom).toHaveBeenCalled());
  });
});

describe('LobbyView password step', () => {
  const setupLobbyStore = (roomOverrides: Record<string, unknown>) =>
    configureStore({
      initialState: {
        auth: { state: 'authorized' },
        user: { role: Role.User, participantKind: ParticipationKind.Unregistered },
        room: { invite: {}, ...roomOverrides },
      },
    });

  afterEach(() => {
    setRoomEventInfo();
    sessionStorage.clear();
    vi.resetAllMocks();
  });

  it('shows the dedicated password step for a password-protected room', () => {
    setRoomEventInfo({ passwordRequired: true });
    const { store } = setupLobbyStore({ connectionState: ConnectionState.Setup });
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    expect(screen.getByText('lobby-password-step-heading')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('lobby-password-placeholder')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('lobby-name-placeholder')).not.toBeInTheDocument();
  });

  it('does not open the connection automatically for password-protected rooms', () => {
    setRoomEventInfo({ passwordRequired: true });
    const { store } = setupLobbyStore({ connectionState: ConnectionState.Setup });
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    expect(startRoom).not.toHaveBeenCalled();
  });

  it('keeps the continue button disabled until a password is entered', async () => {
    setRoomEventInfo({ passwordRequired: true });
    const { store } = setupLobbyStore({ connectionState: ConnectionState.Setup });
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    expect(screen.getByRole('button', { name: 'global-continue' })).toBeDisabled();

    await user.type(screen.getByPlaceholderText('lobby-password-placeholder'), 'secret');

    await waitFor(() => expect(screen.getByRole('button', { name: 'global-continue' })).toBeEnabled());
  });

  it('opens the lobby connection with the entered password on continue, without a display name', async () => {
    setRoomEventInfo({ passwordRequired: true });
    const { store } = setupLobbyStore({ connectionState: ConnectionState.Setup });
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    expect(screen.queryByPlaceholderText('lobby-name-placeholder')).not.toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('lobby-password-placeholder'), 'secret');
    await user.click(screen.getByRole('button', { name: 'global-continue' }));

    await waitFor(() => expect(startRoom).toHaveBeenCalledWith(expect.objectContaining({ password: 'secret' })));
  });

  it('shows the standard join screen once the connection reaches the lobby', async () => {
    setRoomEventInfo({ passwordRequired: true });
    const { store } = setupLobbyStore({ connectionState: ConnectionState.Setup });
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    await user.type(screen.getByPlaceholderText('lobby-password-placeholder'), 'secret');
    await user.click(screen.getByRole('button', { name: 'global-continue' }));

    store.dispatch(joinedLobby({ canEnter: true, displayName: undefined, participantId: 'participant-id' as never }));

    expect(await screen.findByPlaceholderText('lobby-name-placeholder')).toBeInTheDocument();
    expect(screen.queryByText('lobby-password-step-heading')).not.toBeInTheDocument();
  });

  it('shows the password step again to retry after a failed credentials state', async () => {
    setRoomEventInfo({ passwordRequired: true });
    const { store } = setupLobbyStore({ connectionState: ConnectionState.FailedCredentials });
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    expect(screen.getByText('lobby-password-step-heading')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('lobby-password-placeholder'), 'secret');
    await user.click(screen.getByRole('button', { name: 'global-continue' }));

    await waitFor(() => expect(startRoom).toHaveBeenCalledWith(expect.objectContaining({ password: 'secret' })));
  });

  it('sends enter_room with the entered name after joining a password-protected room', async () => {
    setRoomEventInfo({ passwordRequired: true });
    const { store, dispatchSpy } = setupLobbyStore({ connectionState: ConnectionState.Setup });
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    await user.type(screen.getByPlaceholderText('lobby-password-placeholder'), 'secret');
    await user.click(screen.getByRole('button', { name: 'global-continue' }));

    await waitFor(() => expect(startRoom).toHaveBeenCalled());

    // Connection established: the standard join screen is shown, the guest enters a name and joins
    store.dispatch(joinedLobby({ canEnter: true, displayName: undefined, participantId: 'participant-id' as never }));

    const name = await screen.findByPlaceholderText('lobby-name-placeholder');
    await user.clear(name);
    await user.type(name, 'Guest');
    await user.click(screen.getByRole('button', { name: 'joinform-enter-now' }));

    await waitFor(() => expect(dispatchSpy).toHaveBeenCalledWith(setDisplayName('Guest')));
    expect(dispatchSpy).toHaveBeenCalledWith(enterRoomCommand.action({ displayName: 'Guest' }));
  });
});

describe('LobbyView guest join (not logged in)', () => {
  beforeEach(() => {
    setRoomEventInfo({ isInvited: false });
  });

  const setupGuestStore = (roomOverrides: Record<string, unknown>) =>
    configureStore({
      initialState: {
        auth: { state: 'anonymous' },
        user: { role: Role.User, participantKind: ParticipationKind.Unregistered },
        room: { passwordRequired: false, invite: {}, ...roomOverrides },
      },
    });

  afterEach(() => {
    setRoomEventInfo();
    sessionStorage.clear();
    vi.resetAllMocks();
  });

  it('opens the connection automatically for a guest without a password', async () => {
    const { store } = setupGuestStore({ connectionState: ConnectionState.Setup });
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    await waitFor(() => expect(startRoom).toHaveBeenCalled());
  });

  it('enables the submit button and lets a guest join after entering a name', async () => {
    const { store, dispatchSpy } = setupGuestStore({ connectionState: ConnectionState.Lobby, canEnter: true });
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    const input = screen.getByPlaceholderText('lobby-name-placeholder');
    await user.clear(input);
    await user.type(input, 'Guest');

    const submitButton = screen.getByRole('button', { name: 'joinform-join-as-guest' });
    await waitFor(() => expect(submitButton).toBeEnabled());

    await user.click(submitButton);

    await waitFor(() => expect(dispatchSpy).toHaveBeenCalledWith(setDisplayName('Guest')));
    expect(dispatchSpy).toHaveBeenCalledWith(enterRoomCommand.action({ displayName: 'Guest' }));
  });

  it('shows the sign in required step when the room event endpoint returns 401', () => {
    mocks.roomEventInfo = { error: { status: 401 } };
    const { store } = setupGuestStore({ connectionState: ConnectionState.Setup });
    renderWithProviders(
      <AuthContext.Provider value={{ signIn: vi.fn(), signOut: vi.fn() } as never}>
        <LobbyView />
      </AuthContext.Provider>,
      { store, provider: { router: true, mui: true } }
    );

    expect(screen.getByRole('heading', { name: 'lobby-sign-in-required-heading' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'dashboard-sign-in' })).toBeInTheDocument();
  });
});

describe('LobbyView switch account', () => {
  const setupStore = (authState: 'authorized' | 'anonymous') =>
    configureStore({
      initialState: {
        auth: { state: authState },
        user: { role: Role.User, participantKind: ParticipationKind.Unregistered },
        room: { invite: {}, connectionState: ConnectionState.Lobby, canEnter: true },
      },
    });

  const setupLobby = (store: ReturnType<typeof configureStore>['store'], signInError?: Error) => {
    const auth = { signIn: vi.fn(() => Promise.resolve()), signOut: vi.fn() };
    if (signInError) {
      auth.signIn.mockRejectedValue(signInError);
    }
    renderWithProviders(
      <AuthContext.Provider value={auth as never}>
        <MemoryRouter initialEntries={['/room/room-id']}>
          <LobbyView />
        </MemoryRouter>
      </AuthContext.Provider>,
      { store, provider: { mui: true } }
    );
    return auth;
  };

  afterEach(() => {
    setRoomEventInfo();
    sessionStorage.clear();
    vi.resetAllMocks();
  });

  it('shows the switch account link below the name field for a logged in user', () => {
    const { store } = setupStore('authorized');
    setupLobby(store);

    const form = screen.getByRole('form', { name: 'joinform-title' });
    expect(within(form).getByRole('button', { name: 'lobby-switch-account' })).toBeInTheDocument();
  });

  it('does not show the switch account link for a user who is not logged in', () => {
    const { store } = setupStore('anonymous');
    setupLobby(store);

    expect(screen.queryByRole('button', { name: 'lobby-switch-account' })).not.toBeInTheDocument();
  });

  it('signs out without submitting the join form when switching the account', async () => {
    const { store, dispatchSpy } = setupStore('authorized');
    const user = userEvent.setup({ delay: null });
    const auth = setupLobby(store);

    await user.click(screen.getByRole('button', { name: 'lobby-switch-account' }));

    expect(auth.signOut).toHaveBeenCalledOnce();
    expect(sessionStorage.getItem(SWITCH_ACCOUNT_STORAGE_KEY)).toBe('true');
    expect(dispatchSpy).not.toHaveBeenCalledWith(enterRoomCommand.action({ displayName: 'Test' }));
  });

  it('starts the sign in without opening a guest connection after signing out to switch the account', async () => {
    const { store } = configureStore({
      initialState: {
        auth: { state: 'anonymous' },
        user: { role: Role.User, participantKind: ParticipationKind.Unregistered },
        room: { invite: {}, connectionState: ConnectionState.Setup },
      },
    });
    sessionStorage.setItem(SWITCH_ACCOUNT_STORAGE_KEY, 'true');
    const auth = setupLobby(store);

    await waitFor(() => expect(auth.signIn).toHaveBeenCalledExactlyOnceWith());
    expect(startRoom).not.toHaveBeenCalled();
    expect(screen.queryByPlaceholderText('lobby-name-placeholder')).not.toBeInTheDocument();
  });

  it('keeps the guest connection closed when switching accounts fails', async () => {
    const error = new Error('unavailable');
    const logError = vi.spyOn(log, 'error').mockImplementation(() => undefined);
    setRoomEventInfo({ isInvited: false });
    const { store } = configureStore({
      initialState: {
        auth: { state: 'anonymous' },
        room: { connectionState: ConnectionState.Setup },
      },
    });
    sessionStorage.setItem(SWITCH_ACCOUNT_STORAGE_KEY, 'true');
    setupLobby(store, error);

    await waitFor(() => expect(navigateTo).toHaveBeenCalledExactlyOnceWith('/server-issue'));
    expect(logError).toHaveBeenCalledExactlyOnceWith('failed to signIn:', error);
    expect(startRoom).not.toHaveBeenCalled();
    expect(screen.queryByTestId('self-test')).not.toBeInTheDocument();
    expect(sessionStorage.getItem(SWITCH_ACCOUNT_STORAGE_KEY)).toBeNull();
    logError.mockRestore();
  });

  it('shows the sign in hint below the name field for a user who is not logged in', () => {
    const { store } = setupStore('anonymous');
    setupLobby(store);

    const form = screen.getByRole('form', { name: 'joinform-title' });
    expect(within(form).getByText('lobby-already-registered', { exact: false })).toBeInTheDocument();
    expect(within(form).getByRole('button', { name: 'dashboard-sign-in' })).toBeInTheDocument();
  });

  it('does not show the sign in link for a logged in user', () => {
    const { store } = setupStore('authorized');
    setupLobby(store);

    expect(screen.queryByRole('button', { name: 'dashboard-sign-in' })).not.toBeInTheDocument();
  });

  it('starts the sign in returning to the lobby without submitting the join form', async () => {
    const { store, dispatchSpy } = setupStore('anonymous');
    const user = userEvent.setup({ delay: null });
    const auth = setupLobby(store);

    await user.click(screen.getByRole('button', { name: 'dashboard-sign-in' }));

    // Without a redirect url the current location (the room lobby) is saved as the target after signing in
    expect(auth.signIn).toHaveBeenCalledExactlyOnceWith();
    expect(auth.signOut).not.toHaveBeenCalled();
    expect(dispatchSpy).not.toHaveBeenCalledWith(enterRoomCommand.action({ displayName: 'Test' }));
  });
});

describe('LobbyView submit button label', () => {
  const setupStore = (authState: 'authorized' | 'anonymous', roomOverrides: Record<string, unknown> = {}) =>
    configureStore({
      initialState: {
        auth: { state: authState },
        user: { role: Role.User, participantKind: ParticipationKind.Unregistered },
        room: { invite: {}, connectionState: ConnectionState.Lobby, canEnter: true, ...roomOverrides },
      },
    });

  afterEach(() => {
    setRoomEventInfo();
    sessionStorage.clear();
    vi.resetAllMocks();
  });

  it('shows "join as guest" for a logged in user who is not invited', () => {
    setRoomEventInfo({ isInvited: false });
    const { store } = setupStore('authorized');
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    expect(screen.getByRole('button', { name: 'joinform-join-as-guest' })).toBeEnabled();
  });

  it('shows "enter now" for a logged in user who is invited', () => {
    setRoomEventInfo({ isInvited: true });
    const { store } = setupStore('authorized');
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    expect(screen.getByRole('button', { name: 'joinform-enter-now' })).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'joinform-join-as-guest' })).not.toBeInTheDocument();
  });

  it.each(['authorized', 'anonymous'] as const)(
    'keeps "join as guest" disabled during setup when event info returns 404 (%s)',
    async (authState) => {
      mocks.roomEventInfo = { error: { status: 404 } };
      const { store } = setupStore(authState, { connectionState: ConnectionState.Setup });
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

      const input = screen.getByPlaceholderText('lobby-name-placeholder');
      await user.clear(input);
      await user.type(input, 'Guest');

      expect(screen.getByRole('button', { name: 'joinform-join-as-guest' })).toBeDisabled();
      expect(startRoom).not.toHaveBeenCalled();
    }
  );

  it('shows "request to join" for a guest when a moderator has to admit the participant', () => {
    setRoomEventInfo({ isInvited: false });
    const { store } = setupStore('anonymous', { canEnter: false });
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    expect(screen.getByRole('button', { name: 'joinform-request-to-join' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'joinform-join-as-guest' })).not.toBeInTheDocument();
  });

  it('sends enter_room when a logged in user who is not invited joins as guest', async () => {
    setRoomEventInfo({ isInvited: false });
    const { store, dispatchSpy } = setupStore('authorized');
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    await user.click(screen.getByRole('button', { name: 'joinform-join-as-guest' }));

    await waitFor(() => expect(dispatchSpy).toHaveBeenCalledWith(enterRoomCommand.action({ displayName: 'Test' })));
  });
});

describe('LobbyView access denied', () => {
  const setupStore = (authState: 'authorized' | 'anonymous') =>
    configureStore({
      initialState: {
        auth: { state: authState },
        user: { role: Role.User, participantKind: ParticipationKind.Unregistered },
        room: { invite: {}, connectionState: ConnectionState.Setup },
      },
    });

  const setupLobby = (store: ReturnType<typeof configureStore>['store']) => {
    const auth = { signIn: vi.fn(() => Promise.resolve()), signOut: vi.fn() };
    renderWithProviders(
      <AuthContext.Provider value={auth as never}>
        <MemoryRouter initialEntries={['/room/room-id']}>
          <LobbyView />
        </MemoryRouter>
      </AuthContext.Provider>,
      { store, provider: { mui: true } }
    );
    return auth;
  };

  afterEach(() => {
    setRoomEventInfo();
    sessionStorage.clear();
    vi.resetAllMocks();
  });

  it('lets a guest sign in when the meeting does not allow guests', async () => {
    mocks.roomEventInfo = { error: { status: 401 } };
    const { store } = setupStore('anonymous');
    const user = userEvent.setup({ delay: null });
    const auth = setupLobby(store);

    expect(screen.getByRole('heading', { name: 'lobby-sign-in-required-heading' })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('lobby-name-placeholder')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'dashboard-sign-in' }));

    expect(auth.signIn).toHaveBeenCalledExactlyOnceWith();
    expect(startRoom).not.toHaveBeenCalled();
  });

  it('lets a logged in user who is not invited switch the account when the meeting does not allow guests', async () => {
    mocks.roomEventInfo = { error: { status: 403 } };
    const { store } = setupStore('authorized');
    const user = userEvent.setup({ delay: null });
    const auth = setupLobby(store);

    expect(screen.getByRole('heading', { name: 'lobby-no-access-heading' })).toBeInTheDocument();
    expect(screen.getByText('lobby-signed-in-as')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('lobby-name-placeholder')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'lobby-switch-account' }));

    expect(auth.signOut).toHaveBeenCalledOnce();
    expect(sessionStorage.getItem(SWITCH_ACCOUNT_STORAGE_KEY)).toBe('true');
    expect(startRoom).not.toHaveBeenCalled();
  });

  it('shows the generic forbidden error for a logged in user receiving a 401', () => {
    mocks.roomEventInfo = { error: { status: 401 } };
    const { store } = setupStore('authorized');
    setupLobby(store);

    expect(screen.getByText('error-access-forbidden')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'lobby-sign-in-required-heading' })).not.toBeInTheDocument();
  });

  it('shows the generic error when loading the room fails without a status', () => {
    mocks.roomEventInfo = { error: { message: 'failed' } };
    const { store } = setupStore('anonymous');
    setupLobby(store);

    expect(screen.getByText('error-general')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('lobby-name-placeholder')).not.toBeInTheDocument();
    expect(startRoom).not.toHaveBeenCalled();
  });

  it('shows the generic forbidden error for a guest receiving a 403', () => {
    mocks.roomEventInfo = { error: { status: 403 } };
    const { store } = setupStore('anonymous');
    setupLobby(store);

    expect(screen.getByText('error-access-forbidden')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'lobby-no-access-heading' })).not.toBeInTheDocument();
  });
});
