// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { configureStore, eventMockedData, renderWithProviders } from '../../../../utils/testUtils';
import { MeetingsProp } from '../types';
import EventsOverview from './EventsOverview';

const mockEvents = [
  {
    title: 'Time Independent Meetings',
    events: [{ ...eventMockedData }],
  },
];

vi.mock('../../../../components/MeetingCard', async (importOriginal) => ({
  ...(await importOriginal()),
  __esModule: true,
  default: () => <div data-testid="MeetingCard" />,
}));

describe('EventsOverview', () => {
  it('page will not crash', () => {
    const { store } = configureStore();
    renderWithProviders(
      <EventsOverview entries={mockEvents as MeetingsProp[]} isFetching={false} isLoading={false} />,
      { store, provider: { mui: true } }
    );
    expect(screen.getAllByTestId('EventAccordion')).toHaveLength(1);
  });

  it('does not render the accordion title', () => {
    const { store } = configureStore();
    renderWithProviders(
      <EventsOverview entries={mockEvents as MeetingsProp[]} isFetching={false} isLoading={false} />,
      { store, provider: { mui: true } }
    );
    expect(screen.getByText('Time Independent Meetings')).toBeInTheDocument();
  });
});
