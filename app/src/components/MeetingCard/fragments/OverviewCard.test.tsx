// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Event, InviteStatus, UserId, TimelessEvent } from '@opentalk/rest-api-rtk-query';
import { screen, fireEvent } from '@testing-library/react';

import { renderWithProviders, eventMockedData } from '../../../utils/testUtils';
import OverviewCard from './OverviewCard';

jest.mock('../../EventTimePreview/EventTimePreview', () => ({
  __esModule: true,
  default: () => <time />,
}));

jest.mock('../../../commonComponents', () => ({
  notifications: { error: () => jest.fn(), success: () => jest.fn() },
}));

jest.mock('./MeetingPopover', () => ({
  __esModule: true,
  default: () => <div data-testid="MeetingPopover"></div>,
  MeetingCardFragmentProps: () => <div />,
}));

const timeDependentMeeting = {
  ...eventMockedData,
  inviteStatus: InviteStatus.Pending,
  isTimeIndependent: false,
  startsAt: {
    datetime: '2022-08-31T16:47+00:00',
  },
  endsAt: {
    datetime: '2022-08-31T16:47+00:00',
  },
} as Event;

const mockedMeeting = { ...eventMockedData } as TimelessEvent;

const mockAcceptEventInvite = jest.fn();
const mockDeclineEventInvite = jest.fn();

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
  useDeleteEventMutation: () => [
    jest.fn(),
    {
      isLoading: false,
    },
  ],
  useAcceptEventInviteMutation: () => [
    mockAcceptEventInvite,
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
  useGetMeQuery: () => ({
    data: {
      id: '3645d74d-9a4b-4cd4-9d9f-f1871c970167' as UserId,
    },
  }),
}));

describe('OverviewCard', () => {
  it('component is rendered without crashing', () => {
    renderWithProviders(<OverviewCard isMeetingCreator={false} event={mockedMeeting} />, {
      provider: { router: true, mui: true },
    });

    expect(screen.getByTestId('MeetingOverviewCard')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'global-favorite' })).toBeInTheDocument();
  });

  it('component is not marked as favorite', () => {
    renderWithProviders(<OverviewCard isMeetingCreator={false} event={{ ...mockedMeeting, isFavorite: false }} />, {
      provider: { router: true, mui: true },
    });

    expect(screen.queryByTestId('favorite-icon-visible')).not.toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'global-favorite' })).not.toBeInTheDocument();
  });

  it('pending invite displays right action buttons', () => {
    renderWithProviders(<OverviewCard isMeetingCreator={false} event={timeDependentMeeting} />, {
      provider: { router: true, mui: true },
    });

    const acceptButton = screen.getByRole('button', { name: /global-accept/i });
    const declineButton = screen.getByRole('button', { name: /global-decline/i });

    expect(acceptButton).toBeInTheDocument();
    expect(declineButton).toBeInTheDocument();
  });

  it('click on pending invite accept button should triger right action', () => {
    renderWithProviders(<OverviewCard isMeetingCreator={false} event={timeDependentMeeting} />, {
      provider: { router: true, mui: true },
    });
    const acceptButton = screen.getByRole('button', { name: /global-accept/i });
    expect(acceptButton).toBeInTheDocument();
    fireEvent.click(acceptButton);

    expect(mockAcceptEventInvite).toHaveBeenCalledTimes(1);
  });

  it('click on pending invite decline button should triger right action', () => {
    renderWithProviders(<OverviewCard isMeetingCreator={false} event={timeDependentMeeting} />, {
      provider: { router: true, mui: true },
    });
    const declineButton = screen.getByRole('button', { name: /global-decline/i });
    expect(declineButton).toBeInTheDocument();
    fireEvent.click(declineButton);

    expect(mockDeclineEventInvite).toHaveBeenCalledTimes(1);
  });

  it('click on more menu should display popup with edit, fav and delete options for meeting creator', () => {
    renderWithProviders(<OverviewCard isMeetingCreator={true} event={mockedMeeting} />, {
      provider: { router: true, mui: true },
    });

    expect(screen.getByTestId('MeetingPopover')).toBeInTheDocument();
  });
});
