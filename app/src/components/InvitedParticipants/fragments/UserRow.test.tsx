// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Email, EventId, InviteStatus, UserId, UserRole } from '@opentalk/rest-api-rtk-query';
import { fireEvent, screen } from '@testing-library/react';
import { v4 as uuidv4 } from 'uuid';
import { Mock } from 'vitest';

import { useGetEventQuery, useGetMeQuery } from '../../../api/rest';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import UserRow from './UserRow';

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

const mockOnRevokeUserInvite = vi.fn();
const mockOnRemoveUser = vi.fn();
const mockUpdateEventInvite = vi.fn();

vi.mock('../../../api/rest', async (importOriginal) => ({
  ...(await importOriginal()),
  useGetEventQuery: vi.fn().mockImplementation(() => vi.fn()),
  useGetMeQuery: vi.fn().mockImplementation(() => vi.fn()),
  useUpdateEventInviteMutation: () => [mockUpdateEventInvite],
}));

describe('UserRow', () => {
  const { store } = configureStore();

  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    (useGetEventQuery as Mock).mockReturnValue({
      isLoading: false,
      data: {
        createdBy: {
          id: 'MOCK_USER_ID' as UserId,
        },
      },
    });
    (useGetMeQuery as Mock).mockReturnValue({
      isLoading: false,
      data: {
        id: 'MOCK_USER_ID' as UserId,
      },
    });
  });

  it('renders without errors', () => {
    renderWithProviders(
      <UserRow
        eventId={'SOME_EVENT_ID' as EventId}
        isUpdatable={true}
        eventInvite={eventInviteRoleModerator}
        onRevokeUserInvite={mockOnRevokeUserInvite}
        onRemoveUser={mockOnRemoveUser}
      />,
      { store, provider: { mui: true } }
    );

    expect(screen.getByTestId('UserRow')).toBeInTheDocument();
  });

  it('shows more menu when isUpdatable is true', () => {
    renderWithProviders(
      <UserRow
        eventId={'SOME_EVENT_ID' as EventId}
        isUpdatable={true}
        eventInvite={eventInviteRoleModerator}
        onRevokeUserInvite={mockOnRevokeUserInvite}
        onRemoveUser={mockOnRemoveUser}
      />,
      { store, provider: { mui: true } }
    );
    fireEvent.mouseEnter(screen.getByTestId('UserRow'));

    expect(screen.getByTestId('MoreIconButton')).toBeInTheDocument();
  });

  it('does not render more menu if user is not creator', () => {
    (useGetEventQuery as Mock).mockReturnValue({
      isLoading: false,
      data: {
        createdBy: {
          id: 'SOME_OTHER_ID' as UserId,
        },
      },
    });
    renderWithProviders(
      <UserRow
        eventId={'SOME_EVENT_ID' as EventId}
        isUpdatable={true}
        eventInvite={eventInviteRoleModerator}
        onRevokeUserInvite={mockOnRevokeUserInvite}
        onRemoveUser={mockOnRemoveUser}
      />,
      { store, provider: { mui: true } }
    );
    fireEvent.mouseEnter(screen.getByTestId('UserRow'));

    expect(screen.queryByTestId('MoreIconButton')).not.toBeInTheDocument();
  });

  it('opens menu when clicking on more button', () => {
    renderWithProviders(
      <UserRow
        eventId={'SOME_EVENT_ID' as EventId}
        isUpdatable={true}
        eventInvite={eventInviteRoleModerator}
        onRevokeUserInvite={mockOnRevokeUserInvite}
        onRemoveUser={mockOnRemoveUser}
      />,
      { store, provider: { mui: true } }
    );
    fireEvent.mouseEnter(screen.getByTestId('UserRow'));
    fireEvent.click(screen.getByTestId('MoreIconButton'));

    expect(screen.getByTestId('MoreMenu')).toBeInTheDocument();
  });

  it('renders grant moderator menu item and calls update event with grant parameter', () => {
    renderWithProviders(
      <UserRow
        eventId={'SOME_EVENT_ID' as EventId}
        isUpdatable={true}
        eventInvite={eventInviteRoleUser}
        onRevokeUserInvite={mockOnRevokeUserInvite}
        onRemoveUser={mockOnRemoveUser}
      />,
      { store, provider: { mui: true } }
    );
    fireEvent.mouseEnter(screen.getByTestId('UserRow'));
    fireEvent.click(screen.getByTestId('MoreIconButton'));

    expect(screen.getByText('dashboard-meeting-grant-moderator-rights')).toBeInTheDocument();

    fireEvent.click(screen.getByText('dashboard-meeting-grant-moderator-rights'));

    expect(mockUpdateEventInvite).toHaveBeenCalledExactlyOnceWith({
      userId: eventInviteRoleUser.profile.id,
      eventId: 'SOME_EVENT_ID',
      role: UserRole.MODERATOR,
    });
  });

  it('renders revoke menu item and calls update event with revoke parameter', () => {
    renderWithProviders(
      <UserRow
        eventId={'SOME_EVENT_ID' as EventId}
        isUpdatable={true}
        eventInvite={eventInviteRoleModerator}
        onRevokeUserInvite={mockOnRevokeUserInvite}
        onRemoveUser={mockOnRemoveUser}
      />,
      { store, provider: { mui: true } }
    );

    fireEvent.mouseEnter(screen.getByTestId('UserRow'));
    fireEvent.click(screen.getByTestId('MoreIconButton'));

    expect(screen.getByText('dashboard-meeting-revoke-moderator-rights')).toBeInTheDocument();

    fireEvent.click(screen.getByText('dashboard-meeting-revoke-moderator-rights'));

    expect(mockUpdateEventInvite).toHaveBeenCalledExactlyOnceWith({
      userId: eventInviteRoleModerator.profile.id,
      eventId: 'SOME_EVENT_ID',
      role: UserRole.USER,
    });
  });
});
