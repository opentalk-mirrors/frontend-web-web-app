// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useMediaQuery } from '@mui/material';
import { DateTime } from '@opentalk/rest-api-rtk-query';
import { render, screen } from '@testing-library/react';
import { ComponentPropsWithoutRef } from 'react';
import { Mock } from 'vitest';

import { TimePerspectiveFilter } from '../../../../utils/eventUtils';
import { EventFilterButtonBar } from './EventFilterButtonBar';
import { EventPageFilters } from './EventPageFilters';
import { TimeFilter } from './EventsPageHeader';
import EventsPageHeader from './EventsPageHeader';

vi.mock('@mui/material', async () => {
  const actual = await vi.importActual<typeof import('@mui/material')>('@mui/material');

  return {
    ...actual,
    useMediaQuery: vi.fn().mockReturnValue(false),
  };
});

vi.mock('./CreateNewMeetingButton', () => ({
  CreateNewMeetingButton: () => <div data-testid="create-new-meeting-button" />,
}));

vi.mock('./EventFilterButtonBar', () => ({
  EventFilterButtonBar: (props: ComponentPropsWithoutRef<typeof EventFilterButtonBar>) => (
    <button data-testid="event-filter-button-bar" onClick={() => props.onFilterChange('favoriteMeetings', true)} />
  ),
}));

vi.mock('./EventPageFilters', () => ({
  EventPageFilters: (props: ComponentPropsWithoutRef<typeof EventPageFilters>) => (
    <button data-testid="event-page-filters" onClick={() => props.onFilterChange('favoriteMeetings', true)} />
  ),
}));

describe('Events Page Header tests', () => {
  const onFilterChange = vi.fn();

  const filter = {
    timePeriod: TimeFilter.Month,
    timeMin: new Date().toTimeString() as DateTime,
    openInvitedMeeting: false,
    favoriteMeetings: false,
    timePerspective: TimePerspectiveFilter.TimeIndependent,
  };

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('mobile', () => {
    it('can render', () => {
      render(<EventsPageHeader entries={[]} onFilterChange={onFilterChange} filters={filter} title="" />);

      expect(screen.getByTestId('events-page-header-mobile')).toBeInTheDocument();
    });
  });

  describe('tablet', () => {
    it('can render', () => {
      (useMediaQuery as Mock).mockReturnValueOnce(false).mockReturnValueOnce(true);
      render(<EventsPageHeader entries={[]} onFilterChange={onFilterChange} filters={filter} title="" />);

      expect(screen.getByTestId('events-page-header-tablet')).toBeInTheDocument();
    });
  });

  describe('desktop', () => {
    it('can render', () => {
      (useMediaQuery as Mock).mockReturnValueOnce(true).mockReturnValueOnce(false);
      render(<EventsPageHeader entries={[]} onFilterChange={onFilterChange} filters={filter} title="" />);

      expect(screen.getByTestId('events-page-header-desktop')).toBeInTheDocument();
    });
  });
});
