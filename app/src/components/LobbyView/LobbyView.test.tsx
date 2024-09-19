// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { InviteCode } from '@opentalk/rest-api-rtk-query';
import { PropsWithChildren } from 'react';

import { Role } from '../../api/types/incoming/control';
import * as UseInviteCodeModule from '../../hooks/useInviteCode';
import { render, screen, fireEvent, waitFor, cleanup, configureStore } from '../../utils/testUtils';
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

jest.mock('../SelfTest', () => ({
  __esModule: true,
  default: () => <div data-testid="selfTest"></div>,
}));

describe('LobbyForm', () => {
  const { store /*, dispatch*/ } = configureStore({
    initialState: {
      auth: { isAuthed: true },
      user: { loggedIdToken: undefined, role: Role.Guest },
      room: { passwordRequired: true, invite: { inviteCode: 'inviteCode' } },
    },
  });
  afterEach(() => cleanup());

  test('LobyFormShouldRender', async () => {
    await render(<LobbyView />, store);
    expect(screen.getByTestId('selfTest')).toBeInTheDocument();
  });

  xtest('render LobbyForm component without crashing for authed user', async () => {
    //As we now get the invite code in components from the query params we need to mock a value for it.
    const useInviteCodeMock = jest.spyOn(UseInviteCodeModule, 'useInviteCode');
    useInviteCodeMock.mockReturnValue('invite-code' as InviteCode);

    await render(<LobbyView />, store);

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

  xtest('submit button is disabled if user is not logged in', async () => {
    const { store } = configureStore({
      initialState: {
        user: { loggedIn: false, role: Role.User },
      },
    });
    await render(<LobbyView />, store);

    const submitButton = screen.getByRole('button', { name: /joinform-enter-now/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveAttribute('disabled');
  });

  xtest('adding values to input fileds and click on submit should submit added values', async () => {
    const USERNAME = 'lobbyForm testUserName*7';
    const PASSWORD = 'lobbyFormPassword (*';
    await render(<LobbyView />, store);

    const userNameInput = screen.getByPlaceholderText('lobby-name-placeholder');
    expect(userNameInput).toBeInTheDocument();

    fireEvent.change(userNameInput, { target: { value: USERNAME } });
    await waitFor(() => {
      expect(userNameInput).toHaveValue(USERNAME);
    });

    const passwordInput = screen.getByPlaceholderText('lobby-password-placeholder');
    expect(passwordInput).toBeInTheDocument();

    fireEvent.change(passwordInput, { target: { value: PASSWORD } });
    await waitFor(() => {
      expect(passwordInput).toHaveValue(PASSWORD);
    });

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

  xtest('click on toggle visibility button should change input type=text', async () => {
    await render(<LobbyView />, store);

    const passwordInput = screen.getByPlaceholderText('lobby-password-placeholder');
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleVisibilityBtn = screen.getByRole('button', { name: /toggle-password-visibility/i });
    expect(toggleVisibilityBtn).toBeInTheDocument();

    fireEvent.click(toggleVisibilityBtn);
    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  xtest('name field prefilled from displayName', async () => {
    await render(<LobbyView />, store);
    expect(screen.getByPlaceholderText('lobby-name-placeholder')).toHaveDisplayValue('Test');
  });
});
