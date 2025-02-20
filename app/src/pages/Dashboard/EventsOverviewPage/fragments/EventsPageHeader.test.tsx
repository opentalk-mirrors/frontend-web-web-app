// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useMediaQuery } from '@mui/material';
import { DateTime } from '@opentalk/rest-api-rtk-query';
import { render, screen } from '@testing-library/react';
import { ComponentPropsWithoutRef } from 'react';

import { TimePerspectiveFilter } from '../../../../utils/eventUtils';
import { EventFilterButtonBar } from './EventFilterButtonBar';
import { EventPageFilters } from './EventPageFilters';
import { TimeFilter } from './EventsPageHeader';
import EventsPageHeader from './EventsPageHeader';

jest.mock('@mui/material', () => {
  const mui = jest.requireActual('@mui/material');
  return {
    ...mui,
    useMediaQuery: jest.fn().mockReturnValue(false),
  };
});

jest.mock('./CreateNewMeetingButton', () => ({
  CreateNewMeetingButton: () => <div data-testid="create-new-meeting-button" />,
}));

jest.mock('./EventFilterButtonBar', () => ({
  EventFilterButtonBar: (props: ComponentPropsWithoutRef<typeof EventFilterButtonBar>) => (
    <button data-testid="event-filter-button-bar" onClick={() => props.onFilterChange('favoriteMeetings', true)} />
  ),
}));

jest.mock('./EventPageFilters', () => ({
  EventPageFilters: (props: ComponentPropsWithoutRef<typeof EventPageFilters>) => (
    <button data-testid="event-page-filters" onClick={() => props.onFilterChange('favoriteMeetings', true)} />
  ),
}));

const mockUseMediaQuery = useMediaQuery as jest.Mock;

describe('Events Page Header tests', () => {
  const onFilterChange = jest.fn();

  const filter = {
    timePeriod: TimeFilter.Month,
    timeMin: new Date().toTimeString() as DateTime,
    openInvitedMeeting: false,
    favoriteMeetings: false,
    timePerspective: TimePerspectiveFilter.TimeIndependent,
  };

  afterEach(() => {
    mockUseMediaQuery.mockClear();
  });

  describe('mobile', () => {
    test('can render', () => {
      render(<EventsPageHeader entries={[]} onFilterChange={onFilterChange} filters={filter} title="" />);

      expect(screen.getByTestId('events-page-header-mobile')).toBeInTheDocument();
    });
  });

  describe('tablet', () => {
    test('can render', () => {
      mockUseMediaQuery.mockReturnValueOnce(false).mockReturnValueOnce(true);
      render(<EventsPageHeader entries={[]} onFilterChange={onFilterChange} filters={filter} title="" />);

      expect(screen.getByTestId('events-page-header-tablet')).toBeInTheDocument();
    });
  });

  describe('desktop', () => {
    test('can render', () => {
      mockUseMediaQuery.mockReturnValueOnce(true).mockReturnValueOnce(false);
      render(<EventsPageHeader entries={[]} onFilterChange={onFilterChange} filters={filter} title="" />);

      expect(screen.getByTestId('events-page-header-desktop')).toBeInTheDocument();
    });
  });
});
