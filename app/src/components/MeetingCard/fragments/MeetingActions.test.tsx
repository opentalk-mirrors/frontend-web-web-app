// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Event, InviteStatus } from '@opentalk/rest-api-rtk-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Mock } from 'vitest';

import { useAppSelector } from '../../../hooks';
import { renderWithProviders, eventMockedData } from '../../../utils/testUtils';
import { MeetingActions } from './MeetingActions';

vi.mock('../../../commonComponents', async (importOriginal) => ({
  ...(await importOriginal()),
  notifications: {
    success: vi.fn(),
    error: vi.fn(),
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

const mockDeclineEventInvite = vi.fn();

vi.mock('../../../hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('../../../api/rest', async (importOriginal) => ({
  ...(await importOriginal()),
  useMarkFavoriteEventMutation: () => [
    vi.fn(),
    {
      isLoading: false,
    },
  ],
  useUnmarkFavoriteEventMutation: () => [
    vi.fn(),
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
  useGetRoomTariffQuery: () => ({
    data: {
      modules: {
        core: {
          features: ['guests_allowed'],
        },
      },
    },
  }),
}));

vi.mock('./ConfirmDeleteDialog', () => ({
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
  it('opens menu when popover button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MeetingActions event={eventMockedData} isMeetingCreator={false} />, {
      provider: { router: true, mui: true },
    });

    const popoverButton = screen.getByRole('button', { name: 'toolbar-button-more-tooltip-title' });
    await user.click(popoverButton);
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });
  it('does not show decline button when meeting is not accepted', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MeetingActions event={mockNotAcceptedEvent} isMeetingCreator={false} />, {
      provider: { router: true, mui: true },
    });

    const popoverButton = screen.getByRole('button', { name: 'toolbar-button-more-tooltip-title' });
    await user.click(popoverButton);

    const declineButton = screen.queryByRole('menuitem', { name: 'global-decline-label' });
    expect(declineButton).not.toBeInTheDocument();
  });
  it('declines accepted meeting when button in popover is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MeetingActions event={eventMockedData} isMeetingCreator={false} />, {
      provider: { router: true, mui: true },
    });

    const popoverButton = screen.getByRole('button', { name: 'toolbar-button-more-tooltip-title' });
    await user.click(popoverButton);

    const declineButton = screen.getByRole('menuitem', { name: 'global-decline-label' });
    await user.click(declineButton);

    expect(mockDeclineEventInvite).toHaveBeenCalledTimes(1);
  });

  it('copies the alias-based room link when the room has an alias', async () => {
    const user = userEvent.setup();
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: mockWriteText }, configurable: true });
    (useAppSelector as unknown as Mock).mockReturnValue('https://example.com');

    const eventWithAlias = {
      ...eventMockedData,
      room: { ...eventMockedData.room, alias: 'my-room_abc123' },
    } as Event;

    renderWithProviders(<MeetingActions event={eventWithAlias} isMeetingCreator={false} />, {
      provider: { router: true, mui: true },
    });

    await user.click(screen.getByRole('button', { name: 'toolbar-button-more-tooltip-title' }));
    await user.click(screen.getByRole('menuitem', { name: 'dashboard-meeting-card-popover-copy-link-label' }));

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith('https://example.com/room/my-room_abc123');
    });
  });
});
