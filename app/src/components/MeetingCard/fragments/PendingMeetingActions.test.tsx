// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, fireEvent } from '@testing-library/react';

import { renderWithProviders, eventMockedData } from '../../../utils/testUtils';
import { PendingMeetingActions } from './PendingMeetingActions';

jest.mock('../../../commonComponents', () => ({
  notifications: { error: () => jest.fn(), success: () => jest.fn() },
}));

const mockAcceptEventInvite = jest.fn();
const mockDeclineEventInvite = jest.fn();

jest.mock('../../../api/rest', () => ({
  ...jest.requireActual('../../../api/rest'),
  useAcceptEventInviteMutation: () => [mockAcceptEventInvite],
  useDeclineEventInviteMutation: () => [mockDeclineEventInvite],
}));

describe('PendingMeetingActions', () => {
  it('renders component without crashing', () => {
    renderWithProviders(<PendingMeetingActions event={eventMockedData} />, {
      provider: { router: true, mui: true },
    });

    const acceptButton = screen.getByRole('button', { name: /global-accept/i });
    const declineButton = screen.getByRole('button', { name: /global-decline/i });

    expect(acceptButton).toBeInTheDocument();
    expect(declineButton).toBeInTheDocument();
  });
  it('triggers accept action on accept click', () => {
    renderWithProviders(<PendingMeetingActions event={eventMockedData} />, {
      provider: { router: true, mui: true },
    });
    const acceptButton = screen.getByRole('button', { name: /global-accept/i });
    expect(acceptButton).toBeInTheDocument();
    fireEvent.click(acceptButton);

    expect(mockAcceptEventInvite).toHaveBeenCalledTimes(1);
  });

  it('triggers decline action on decline click', () => {
    renderWithProviders(<PendingMeetingActions event={eventMockedData} />, {
      provider: { router: true, mui: true },
    });
    const declineButton = screen.getByRole('button', { name: /global-decline/i });
    expect(declineButton).toBeInTheDocument();
    fireEvent.click(declineButton);

    expect(mockDeclineEventInvite).toHaveBeenCalledTimes(1);
  });
});
