// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { Email, EventId, UserId } from '@opentalk/rest-api-rtk-query';
import { UserRole, InviteStatus } from '@opentalk/rest-api-rtk-query';
import { cleanup, screen } from '@testing-library/react';
import { v4 as uuidv4 } from 'uuid';

import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import ParticipantList from './ParticipantList';

const invitees = [
  {
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
  },
];

jest.mock('./UserRow', () => ({
  __esModule: true,
  default: () => <div>UserRowMocked</div>,
}));

const mockRemoveSelectedUser = jest.fn();

describe('ParticipantList', () => {
  const { store } = configureStore();

  afterEach(() => cleanup());

  test('will render without errors', () => {
    renderWithProviders(
      <ParticipantList
        eventId={'SOME_EVENT_ID' as EventId}
        invitees={invitees}
        status={InviteStatus.Accepted}
        removeSelectedUser={mockRemoveSelectedUser}
        isUpdatable={true}
      />,
      { store }
    );

    expect(screen.getByTestId('ParticipantList')).toBeInTheDocument();
  });

  test('render UserRow component', () => {
    renderWithProviders(
      <ParticipantList
        eventId={'SOME_EVENT_ID' as EventId}
        invitees={invitees}
        status={InviteStatus.Accepted}
        removeSelectedUser={mockRemoveSelectedUser}
        isUpdatable={true}
      />,
      { store }
    );

    expect(screen.getByTestId('ParticipantListBox').children).toHaveLength(1);
  });

  test('render accept status title', () => {
    renderWithProviders(
      <ParticipantList
        eventId={'SOME_EVENT_ID' as EventId}
        invitees={invitees}
        status={InviteStatus.Accepted}
        removeSelectedUser={mockRemoveSelectedUser}
        isUpdatable={true}
      />,
      { store }
    );

    expect(screen.getByText(`dashboard-meeting-details-page-participant-${InviteStatus.Accepted}`)).toBeInTheDocument();
  });

  test('render declined status title', () => {
    renderWithProviders(
      <ParticipantList
        eventId={'SOME_EVENT_ID' as EventId}
        invitees={invitees}
        status={InviteStatus.Declined}
        removeSelectedUser={mockRemoveSelectedUser}
        isUpdatable={true}
      />,
      { store }
    );

    expect(screen.getByText(`dashboard-meeting-details-page-participant-${InviteStatus.Declined}`)).toBeInTheDocument();
  });

  test('render open/pending status title', () => {
    renderWithProviders(
      <ParticipantList
        eventId={'SOME_EVENT_ID' as EventId}
        invitees={invitees}
        status={InviteStatus.Pending}
        removeSelectedUser={mockRemoveSelectedUser}
        isUpdatable={true}
      />,
      { store }
    );

    expect(screen.getByText(`dashboard-meeting-details-page-participant-${InviteStatus.Pending}`)).toBeInTheDocument();
  });
});
