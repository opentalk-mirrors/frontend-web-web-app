// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Email, EventId, InviteStatus, UserId, UserRole } from '@opentalk/rest-api-rtk-query';
import { fireEvent } from '@testing-library/react';
import { v4 as uuidv4 } from 'uuid';

import { useGetEventQuery, useGetMeQuery, useUpdateEventInviteMutation } from '../../../api/rest';
import { cleanup, configureStore, render, screen, waitFor } from '../../../utils/testUtils';
import UserRow from './UserRow';

const mockUseGetEventQuery = useGetEventQuery as jest.Mock;
const mockUseGetMeQuery = useGetMeQuery as jest.Mock;
const mockUseUpdateEventInviteMutation = useUpdateEventInviteMutation as jest.Mock;

const eventInviteRoleModerator = {
  profile: {
    avatarUrl: 'url',
    displayName: 'Accepted Test User 1',
    email: 'someemail1@mail.com' as Email,
    firstname: 'Accepted Test',
    id: uuidv4() as UserId,
    lastname: 'User 1',
    title: '',
    role: UserRole.MODERATOR,
  },
  status: InviteStatus.Accepted,
};

const eventInviteRoleUser = {
  profile: {
    avatarUrl: 'url',
    displayName: 'Accepted Test User 1',
    email: 'someemail1@mail.com' as Email,
    firstname: 'Accepted Test',
    id: uuidv4() as UserId,
    lastname: 'User 1',
    title: '',
    role: UserRole.USER,
  },
  status: InviteStatus.Accepted,
};

const mockOnRevokeUserInvite = jest.fn();
const mockOnRemoveUser = jest.fn();

jest.mock('../../../api/rest', () => ({
  ...jest.requireActual('../../../api/rest'),
  useGetEventQuery: jest.fn(),
  useGetMeQuery: jest.fn(),
  useUpdateEventInviteMutation: jest.fn(),
}));

describe('UserRow', () => {
  const { store } = configureStore();

  beforeEach(() => {
    mockUseGetEventQuery.mockReturnValue({
      isLoading: false,
      data: {
        createdBy: {
          id: 'MOCK_USER_ID' as UserId,
        },
      },
    });
    mockUseGetMeQuery.mockReturnValue({
      isLoading: false,
      data: {
        id: 'MOCK_USER_ID' as UserId,
      },
    });
    mockUseUpdateEventInviteMutation.mockReturnValue([mockUseUpdateEventInviteMutation]);
  });

  afterEach(() => cleanup());

  test('will render without errors', async () => {
    await render(
      <UserRow
        eventId={'SOME_EVENT_ID' as EventId}
        isUpdatable={true}
        eventInvite={eventInviteRoleModerator}
        onRevokeUserInvite={mockOnRevokeUserInvite}
        onRemoveUser={mockOnRemoveUser}
      />,
      store
    );
    expect(screen.getByTestId('UserRow')).toBeInTheDocument();
  });

  test('will not render more menu if isUpdatable is false', async () => {
    await render(
      <UserRow
        eventId={'SOME_EVENT_ID' as EventId}
        isUpdatable={true}
        eventInvite={eventInviteRoleModerator}
        onRevokeUserInvite={mockOnRevokeUserInvite}
        onRemoveUser={mockOnRemoveUser}
      />,
      store
    );
    fireEvent.mouseEnter(screen.getByTestId('UserRow'));
    await waitFor(() => {
      expect(screen.getByTestId('MoreIconButton')).toBeInTheDocument();
    });
  });

  test('will not render more menu if user is not creator', async () => {
    mockUseGetEventQuery.mockReturnValue({
      isLoading: false,
      data: {
        createdBy: {
          id: 'SOME_OTHER_ID' as UserId,
        },
      },
    });
    await render(
      <UserRow
        eventId={'SOME_EVENT_ID' as EventId}
        isUpdatable={true}
        eventInvite={eventInviteRoleModerator}
        onRevokeUserInvite={mockOnRevokeUserInvite}
        onRemoveUser={mockOnRemoveUser}
      />,
      store
    );
    fireEvent.mouseEnter(screen.getByTestId('UserRow'));
    await waitFor(() => {
      expect(screen.queryByTestId('MoreIconButton')).not.toBeInTheDocument();
    });
  });

  test('click on more button will open menu', async () => {
    await render(
      <UserRow
        eventId={'SOME_EVENT_ID' as EventId}
        isUpdatable={true}
        eventInvite={eventInviteRoleModerator}
        onRevokeUserInvite={mockOnRevokeUserInvite}
        onRemoveUser={mockOnRemoveUser}
      />,
      store
    );
    fireEvent.mouseEnter(screen.getByTestId('UserRow'));
    fireEvent.click(screen.getByTestId('MoreIconButton'));
    await waitFor(() => {
      expect(screen.getByTestId('MoreMenu')).toBeInTheDocument();
    });
  });

  test('more menu renders grant moderator menu item and calls update event with grant parameter', async () => {
    await render(
      <UserRow
        eventId={'SOME_EVENT_ID' as EventId}
        isUpdatable={true}
        eventInvite={eventInviteRoleUser}
        onRevokeUserInvite={mockOnRevokeUserInvite}
        onRemoveUser={mockOnRemoveUser}
      />,
      store
    );
    fireEvent.mouseEnter(screen.getByTestId('UserRow'));
    fireEvent.click(screen.getByTestId('MoreIconButton'));
    await waitFor(() => {
      expect(screen.getByText('dashboard-meeting-grant-moderator-rights')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('dashboard-meeting-grant-moderator-rights'));
    await waitFor(() => {
      expect(mockUseUpdateEventInviteMutation).toHaveBeenCalledWith({
        userId: eventInviteRoleUser.profile.id,
        eventId: 'SOME_EVENT_ID',
        role: UserRole.MODERATOR,
      });
    });
  });

  test('more menu renders revoke menu item and calls update event with revoke parameter', async () => {
    await render(
      <UserRow
        eventId={'SOME_EVENT_ID' as EventId}
        isUpdatable={true}
        eventInvite={eventInviteRoleModerator}
        onRevokeUserInvite={mockOnRevokeUserInvite}
        onRemoveUser={mockOnRemoveUser}
      />,
      store
    );
    fireEvent.mouseEnter(screen.getByTestId('UserRow'));
    fireEvent.click(screen.getByTestId('MoreIconButton'));
    await waitFor(() => {
      expect(screen.getByText('dashboard-meeting-revoke-moderator-rights')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('dashboard-meeting-revoke-moderator-rights'));
    await waitFor(() => {
      expect(mockUseUpdateEventInviteMutation).toHaveBeenCalledWith({
        userId: eventInviteRoleModerator.profile.id,
        eventId: 'SOME_EVENT_ID',
        role: UserRole.USER,
      });
    });
  });
});
