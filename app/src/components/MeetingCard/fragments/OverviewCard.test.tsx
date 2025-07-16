// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { TimelessEvent } from '@opentalk/rest-api-rtk-query';
import { screen } from '@testing-library/react';

import { renderWithProviders, eventMockedData } from '../../../utils/testUtils';
import OverviewCard from './OverviewCard';

jest.mock('../../EventTimePreview/EventTimePreview', () => ({
  __esModule: true,
  default: () => <time />,
}));

jest.mock('./MeetingCardActions', () => ({
  MeetingCardActions: () => <div data-testid="MeetingCardActions"></div>,
}));

const mockedMeeting = { ...eventMockedData } as TimelessEvent;

describe('OverviewCard', () => {
  it('renders without crashing', () => {
    renderWithProviders(<OverviewCard isMeetingCreator={false} event={mockedMeeting} />, {
      provider: { router: true, mui: true },
    });

    expect(screen.getByTestId('MeetingOverviewCard')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'global-favorite' })).toBeInTheDocument();
  });

  it('is not marked as favorite', () => {
    renderWithProviders(<OverviewCard isMeetingCreator={false} event={{ ...mockedMeeting, isFavorite: false }} />, {
      provider: { router: true, mui: true },
    });

    expect(screen.queryByTestId('favorite-icon-visible')).not.toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'global-favorite' })).not.toBeInTheDocument();
  });

  it('contains mocked meeting actions', () => {
    renderWithProviders(<OverviewCard isMeetingCreator={true} event={mockedMeeting} />, {
      provider: { router: true, mui: true },
    });

    expect(screen.getByTestId('MeetingCardActions')).toBeInTheDocument();
  });
});
