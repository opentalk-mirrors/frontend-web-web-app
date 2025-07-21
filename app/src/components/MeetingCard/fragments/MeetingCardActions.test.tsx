// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Event, InviteStatus } from '@opentalk/rest-api-rtk-query';
import { screen } from '@testing-library/react';

import { renderWithProviders, eventMockedData } from '../../../utils/testUtils';
import { MeetingCardActions } from './MeetingCardActions';

const mockPendingMeeting = {
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

jest.mock('../../../commonComponents', () => ({
  notifications: { error: () => jest.fn(), success: () => jest.fn() },
}));

jest.mock('./PendingMeetingActions', () => ({
  PendingMeetingActions: () => <div data-testid="PendingMeetingActions"></div>,
}));

jest.mock('./MeetingActions', () => ({
  MeetingActions: () => <div data-testid="MeetingActions"></div>,
}));

describe('PendingMeetingActions', () => {
  it('renders without crashing', () => {
    renderWithProviders(<MeetingCardActions event={eventMockedData} isMeetingCreator={false} />, {
      provider: { router: true, mui: true },
    });

    expect(screen.getByTestId('MeetingActions')).toBeInTheDocument();
  });
  it('renders pending actions when passed an event with pending invite status', () => {
    renderWithProviders(<MeetingCardActions event={mockPendingMeeting} isMeetingCreator={false} />, {
      provider: { router: true, mui: true },
    });

    expect(screen.getByTestId('PendingMeetingActions')).toBeInTheDocument();
  });
});
