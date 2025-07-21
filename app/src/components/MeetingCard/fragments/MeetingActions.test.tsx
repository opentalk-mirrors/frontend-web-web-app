// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Event, InviteStatus } from '@opentalk/rest-api-rtk-query';
import { fireEvent, screen } from '@testing-library/react';

import { renderWithProviders, eventMockedData } from '../../../utils/testUtils';
import { MeetingActions } from './MeetingActions';

jest.mock('../../../commonComponents', () => ({
  ...jest.requireActual('../../../commonComponents'),
  notifications: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockNotAcceptedEvent = {
  ...eventMockedData,
  inviteStatus: InviteStatus.Added,
  isTimeIndependent: false,
  startsAt: {
    datetime: '2022-08-31T16:47+00:00',
  },
  endsAt: {
    datetime: '2022-08-31T16:47+00:00',
  },
} as Event;

const mockDeclineEventInvite = jest.fn();

jest.mock('../../../hooks', () => ({
  useAppSelector: jest.fn(),
}));

jest.mock('../../../api/rest', () => ({
  ...jest.requireActual('../../../api/rest'),
  useMarkFavoriteEventMutation: () => [
    jest.fn(),
    {
      isLoading: false,
    },
  ],
  useUnmarkFavoriteEventMutation: () => [
    jest.fn(),
    {
      isLoading: false,
    },
  ],
  useLazyGetRoomInvitesQuery: () => [
    jest.fn(),
    {
      isLoading: false,
    },
  ],
  useDeclineEventInviteMutation: () => [
    mockDeclineEventInvite,
    {
      isLoading: false,
    },
  ],
}));

jest.mock('./ConfirmDeleteDialog', () => ({
  ConfirmDeleteDialog: () => <div></div>,
}));

describe('PendingMeetingActions', () => {
  it('renders without crashing', () => {
    renderWithProviders(<MeetingActions event={eventMockedData} isMeetingCreator={false} />, {
      provider: { router: true, mui: true },
    });

    const popoverButton = screen.getByRole('button', { name: 'toolbar-button-more-tooltip-title' });
    const startButton = screen.getByRole('link', { name: 'dashboard-home-join-label' });

    expect(popoverButton).toBeInTheDocument();
    expect(startButton).toBeInTheDocument();
  });
  it('opens menu when popover button is clicked', () => {
    renderWithProviders(<MeetingActions event={eventMockedData} isMeetingCreator={false} />, {
      provider: { router: true, mui: true },
    });

    const popoverButton = screen.getByRole('button', { name: 'toolbar-button-more-tooltip-title' });
    fireEvent.click(popoverButton);
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });
  it('does not show decline button when meeting is not accepted', () => {
    renderWithProviders(<MeetingActions event={mockNotAcceptedEvent} isMeetingCreator={false} />, {
      provider: { router: true, mui: true },
    });

    const popoverButton = screen.getByRole('button', { name: 'toolbar-button-more-tooltip-title' });
    fireEvent.click(popoverButton);

    const declineButton = screen.queryByRole('menuitem', { name: 'global-decline-label' });
    expect(declineButton).not.toBeInTheDocument();
  });
  it('declines accepted meeting when button in popover is clicked', () => {
    renderWithProviders(<MeetingActions event={eventMockedData} isMeetingCreator={false} />, {
      provider: { router: true, mui: true },
    });

    const popoverButton = screen.getByRole('button', { name: 'toolbar-button-more-tooltip-title' });
    fireEvent.click(popoverButton);

    const declineButton = screen.getByRole('menuitem', { name: 'global-decline-label' });
    fireEvent.click(declineButton);

    expect(mockDeclineEventInvite).toHaveBeenCalledTimes(1);
  });
});
