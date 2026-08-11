// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { InviteCode } from '@opentalk/rest-api-rtk-query';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  enterRoom as enterRoomCommand,
  enterWaitingRoom as enterWaitingRoomCommand,
} from '../../api/types/outgoing/core';
import * as UseInviteCodeModule from '../../hooks/useInviteCode';
import { ConnectionState } from '../../modules/WebRTC/ConferenceRoom';
import { startRoom } from '../../store/commonActions';
import { joinedLobby } from '../../store/slices/roomSlice';
import { setDisplayName } from '../../store/slices/userSlice';
import { ParticipationKind, Role } from '../../types/common';
import { renderWithProviders, configureStore } from '../../utils/testUtils';
import LobbyView from './LobbyView';

const mocks = vi.hoisted(() => ({
  roomEventInfo: { data: {} as Record<string, unknown> },
}));

const setPasswordRequired = (passwordRequired: boolean) => {
  mocks.roomEventInfo = { data: { passwordRequired } };
};

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
      auth: { isAuthed: true },
      user: { loggedIdToken: undefined, role: Role.User, participantKind: ParticipationKind.Guest },
      room: { invite: { inviteCode: 'inviteCode' }, connectionState: ConnectionState.Lobby, canEnter: true },
    },
  });
  afterEach(() => {
    setPasswordRequired(false);
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

  it('prefills name field from displayName', () => {
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    expect(screen.getByPlaceholderText('lobby-name-placeholder')).toHaveDisplayValue('Test');
  });
});

describe('LobbyView connect-first WS lobby', () => {
  const setupLobbyStore = (roomOverrides: Record<string, unknown>) =>
    configureStore({
      initialState: {
        auth: { isAuthed: true },
        user: { role: Role.User, participantKind: ParticipationKind.Guest },
        room: { invite: { inviteCode: 'inviteCode' }, ...roomOverrides },
      },
    });

  afterEach(() => {
    setPasswordRequired(false);
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
    vi.spyOn(UseInviteCodeModule, 'useInviteCode').mockReturnValue('invite-code' as InviteCode);
    const { store, dispatchSpy } = setupLobbyStore({ connectionState: ConnectionState.Lobby, canEnter: true });
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    const input = screen.getByPlaceholderText('lobby-name-placeholder');
    await user.clear(input);
    await user.type(input, 'Guest');
    fireEvent.submit(screen.getByRole('form', { name: 'joinform-title' }));

    await waitFor(() => expect(dispatchSpy).toHaveBeenCalledWith(setDisplayName('Guest')));
    expect(dispatchSpy).toHaveBeenCalledWith(enterRoomCommand.action({ displayName: 'Guest' }));
  });

  it('sends enter_waiting_room with the entered name', async () => {
    vi.spyOn(UseInviteCodeModule, 'useInviteCode').mockReturnValue('invite-code' as InviteCode);
    const { store, dispatchSpy } = setupLobbyStore({ connectionState: ConnectionState.Lobby, canEnter: false });
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    const input = screen.getByPlaceholderText('lobby-name-placeholder');
    await user.clear(input);
    await user.type(input, 'Guest');
    fireEvent.submit(screen.getByRole('form', { name: 'joinform-title' }));

    await waitFor(() => expect(dispatchSpy).toHaveBeenCalledWith(setDisplayName('Guest')));
    expect(dispatchSpy).toHaveBeenCalledWith(enterWaitingRoomCommand.action({ displayName: 'Guest' }));
  });

  it('enters without a display name when the server already assigned one', async () => {
    vi.spyOn(UseInviteCodeModule, 'useInviteCode').mockReturnValue('invite-code' as InviteCode);
    const { store, dispatchSpy } = setupLobbyStore({
      connectionState: ConnectionState.Lobby,
      canEnter: true,
      lobbyDisplayName: 'Assigned',
    });
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    fireEvent.submit(screen.getByRole('form', { name: 'joinform-title' }));

    await waitFor(() => expect(dispatchSpy).toHaveBeenCalledWith(enterRoomCommand.action({ displayName: undefined })));
    expect(dispatchSpy).not.toHaveBeenCalledWith(setDisplayName('Assigned'));
  });

  it('requests to join without a display name when the server already assigned one', async () => {
    vi.spyOn(UseInviteCodeModule, 'useInviteCode').mockReturnValue('invite-code' as InviteCode);
    const { store, dispatchSpy } = setupLobbyStore({
      connectionState: ConnectionState.Lobby,
      canEnter: false,
      lobbyDisplayName: 'Assigned',
    });
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    fireEvent.submit(screen.getByRole('form', { name: 'joinform-title' }));

    await waitFor(() =>
      expect(dispatchSpy).toHaveBeenCalledWith(enterWaitingRoomCommand.action({ displayName: undefined }))
    );
  });

  it('opens the connection automatically on refresh, when no password is required', async () => {
    vi.spyOn(UseInviteCodeModule, 'useInviteCode').mockReturnValue('invite-code' as InviteCode);
    const { store } = setupLobbyStore({ connectionState: ConnectionState.Setup });
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    await waitFor(() => expect(startRoom).toHaveBeenCalled());
  });

  it('opens the connection automatically for after hang up from the meeting, when no password is required', async () => {
    vi.spyOn(UseInviteCodeModule, 'useInviteCode').mockReturnValue('invite-code' as InviteCode);
    const { store } = setupLobbyStore({ connectionState: ConnectionState.Left });
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    await waitFor(() => expect(startRoom).toHaveBeenCalled());
  });
});

describe('LobbyView password step', () => {
  const setupLobbyStore = (roomOverrides: Record<string, unknown>) =>
    configureStore({
      initialState: {
        auth: { isAuthed: true },
        user: { role: Role.User, participantKind: ParticipationKind.Guest },
        room: { invite: { inviteCode: 'inviteCode' }, ...roomOverrides },
      },
    });

  afterEach(() => {
    setPasswordRequired(false);
    vi.resetAllMocks();
  });

  it('shows the dedicated password step for a password-protected room', () => {
    setPasswordRequired(true);
    const { store } = setupLobbyStore({ connectionState: ConnectionState.Setup });
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    expect(screen.getByText('lobby-password-step-heading')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('lobby-password-placeholder')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('lobby-name-placeholder')).not.toBeInTheDocument();
  });

  it('does not open the connection automatically for password-protected rooms', () => {
    vi.spyOn(UseInviteCodeModule, 'useInviteCode').mockReturnValue('invite-code' as InviteCode);
    setPasswordRequired(true);
    const { store } = setupLobbyStore({ connectionState: ConnectionState.Setup });
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    expect(startRoom).not.toHaveBeenCalled();
  });

  it('keeps the continue button disabled until a password is entered', async () => {
    setPasswordRequired(true);
    const { store } = setupLobbyStore({ connectionState: ConnectionState.Setup });
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    expect(screen.getByRole('button', { name: 'global-continue' })).toBeDisabled();

    await user.type(screen.getByPlaceholderText('lobby-password-placeholder'), 'secret');

    await waitFor(() => expect(screen.getByRole('button', { name: 'global-continue' })).toBeEnabled());
  });

  it('opens the lobby connection with the entered password on continue, without a display name', async () => {
    vi.spyOn(UseInviteCodeModule, 'useInviteCode').mockReturnValue('invite-code' as InviteCode);
    setPasswordRequired(true);
    const { store } = setupLobbyStore({ connectionState: ConnectionState.Setup });
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    expect(screen.queryByPlaceholderText('lobby-name-placeholder')).not.toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('lobby-password-placeholder'), 'secret');
    await user.click(screen.getByRole('button', { name: 'global-continue' }));

    await waitFor(() => expect(startRoom).toHaveBeenCalledWith(expect.objectContaining({ password: 'secret' })));
  });

  it('shows the standard join screen once the connection reaches the lobby', async () => {
    vi.spyOn(UseInviteCodeModule, 'useInviteCode').mockReturnValue('invite-code' as InviteCode);
    setPasswordRequired(true);
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
    vi.spyOn(UseInviteCodeModule, 'useInviteCode').mockReturnValue('invite-code' as InviteCode);
    setPasswordRequired(true);
    const { store } = setupLobbyStore({ connectionState: ConnectionState.FailedCredentials });
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<LobbyView />, { store, provider: { router: true, mui: true } });

    expect(screen.getByText('lobby-password-step-heading')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('lobby-password-placeholder'), 'secret');
    await user.click(screen.getByRole('button', { name: 'global-continue' }));

    await waitFor(() => expect(startRoom).toHaveBeenCalledWith(expect.objectContaining({ password: 'secret' })));
  });

  it('sends enter_room with the entered name after joining a password-protected room', async () => {
    vi.spyOn(UseInviteCodeModule, 'useInviteCode').mockReturnValue('invite-code' as InviteCode);
    setPasswordRequired(true);
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
    fireEvent.submit(screen.getByRole('form', { name: 'joinform-title' }));

    await waitFor(() => expect(dispatchSpy).toHaveBeenCalledWith(setDisplayName('Guest')));
    expect(dispatchSpy).toHaveBeenCalledWith(enterRoomCommand.action({ displayName: 'Guest' }));
  });
});
