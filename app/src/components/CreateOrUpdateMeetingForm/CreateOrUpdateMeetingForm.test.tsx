// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { DateTimeWithTimezone, SingleEvent } from '@opentalk/rest-api-rtk-query';
import { fireEvent } from '@testing-library/react';
import { formatRFC3339 } from 'date-fns';

import { configureStore, render, screen, cleanup, waitFor, eventMockedData } from '../../utils/testUtils';
import CreateOrUpdateMeetingForm from './CreateOrUpdateMeetingForm';

const mockOnForwardButtonClick = jest.fn();
const mockCreateEvent = jest.fn();
const mockUpdateEvent = jest.fn();
const mockGetLazyEvent = jest.fn();

const mockEvent = {
  ...eventMockedData,
  startsAt: {
    datetime: formatRFC3339(new Date('3022-05-06T13:00:00+02:00')),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  } as DateTimeWithTimezone,
  endsAt: {
    datetime: formatRFC3339(new Date('3022-05-06T17:00:00+02:00')),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  } as DateTimeWithTimezone,
  isTimeIndependent: false,
  isAllDay: false,
  isFavorite: false,
  type: 'instance' as unknown,
} as SingleEvent;

jest.mock('../../api/rest', () => ({
  ...jest.requireActual('../../api/rest'),
  useCreateEventMutation: () => [
    mockCreateEvent,
    {
      isLoading: false,
    },
  ],
  useUpdateEventMutation: () => [
    mockUpdateEvent,
    {
      isLoading: false,
    },
  ],
  useLazyGetEventsQuery: () => [
    mockGetLazyEvent,
    {
      data: { data: [] },
    },
  ],
  useCreateEventSharedFolderMutation: () => [
    mockGetLazyEvent,
    {
      data: { data: [] },
    },
  ],
  useDeleteEventSharedFolderMutation: () => [
    mockGetLazyEvent,
    {
      data: { data: [] },
    },
  ],
  useGetMeTariffQuery: () => [
    mockGetLazyEvent,
    {
      data: { data: [] },
    },
  ],
}));

describe('Dashboard CreateOrUpdateMeetingForm', () => {
  afterEach(() => cleanup());

  test('page will not crash', async () => {
    const { store } = configureStore();
    await render(<CreateOrUpdateMeetingForm onForwardButtonClick={mockOnForwardButtonClick} />, store);
    expect(screen.getAllByText('dashboard-meeting-textfield-title')[0]).toBeInTheDocument();
  });

  test('updateEvent will be called with the right payload', async () => {
    const { store } = configureStore();
    await render(<CreateOrUpdateMeetingForm existingEvent={mockEvent} />, store);

    const submitButton = screen.getByRole('button', { name: 'global-save-changes' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateEvent).toHaveBeenCalledWith({
        description: mockEvent.description,
        endsAt: mockEvent.endsAt,
        eventId: mockEvent.id,
        isAllDay: mockEvent.isAllDay,
        isTimeIndependent: mockEvent.isTimeIndependent,
        password: undefined,
        recurrencePattern: mockEvent.recurrencePattern,
        startsAt: mockEvent.startsAt,
        title: mockEvent.title,
        waitingRoom: mockEvent.room.waitingRoom,
        isAdhoc: mockEvent.isAdhoc,
        showMeetingDetails: mockEvent.showMeetingDetails,
        hasSharedFolder: false,
        streamingTargets: [],
        e2eEncryption: false,
      });
    });
  });
});
