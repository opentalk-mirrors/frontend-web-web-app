// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { Event, EventId } from '@opentalk/rest-api-rtk-query';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { useUpdateEventMutation } from '../../api/rest';
import { notifications } from '../../commonComponents';
import UpdateMeetingForm from './UpdateMeetingForm';
import { MeetingFormValues } from './fragments/DashboardDateTimePicker';
import { createPayload } from './utils/payloadUtils';

interface FormElementWithEvent extends HTMLFormElement {
  _existingEvent?: Event;
}

jest.mock('../../api/rest', () => ({
  useUpdateEventMutation: jest.fn(),
}));

jest.mock('../../commonComponents', () => ({
  notifications: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('./utils/payloadUtils', () => ({
  createPayload: jest.fn(),
}));

jest.mock('./fragments/MeetingForm', () => ({
  __esModule: true,
  default: ({
    onSubmit,
    eventIsLoading,
    existingEvent,
  }: {
    onSubmit: (values: Partial<MeetingFormValues>, handleFormSubmit: () => void) => void;
    eventIsLoading: boolean;
    existingEvent: Event;
  }) => {
    const mockValues = { title: 'Test Meeting' };
    return (
      <form
        aria-label="MeetingForm"
        data-event-is-loading={eventIsLoading}
        ref={(el) => {
          if (el) {
            (el as FormElementWithEvent)._existingEvent = existingEvent;
          }
        }}
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(mockValues, jest.fn());
        }}
      />
    );
  },
}));

const mockedEvent = {
  id: 'c08743df-6de1-4446-95e3-f158ebd81fa0' as EventId,
  title: 'Single Meeting',
} as Event;

describe('UpdateMeetingForm', () => {
  const mockUpdateEvent = jest.fn();

  beforeEach(() => {
    (useUpdateEventMutation as jest.Mock).mockReturnValue([mockUpdateEvent, { isLoading: false }]);
    jest.clearAllMocks();
  });

  it('renders the child form', () => {
    render(<UpdateMeetingForm existingEvent={mockedEvent} onForwardButtonClick={jest.fn()} />);

    expect(screen.getByRole('form', { name: 'MeetingForm' })).toBeInTheDocument();
  });

  it('passes the updated event to the child form', () => {
    render(<UpdateMeetingForm existingEvent={mockedEvent} onForwardButtonClick={jest.fn()} />);

    const form = screen.getByRole('form') as FormElementWithEvent;
    expect(form._existingEvent).toEqual(mockedEvent);
  });

  it('creates payload with form values and existing event on form submission', async () => {
    render(<UpdateMeetingForm existingEvent={mockedEvent} onForwardButtonClick={jest.fn()} />);

    fireEvent.submit(screen.getByRole('form'));
    await waitFor(() => {
      expect(createPayload).toHaveBeenCalledWith({ title: 'Test Meeting' }, mockedEvent);
    });
  });

  it('calls update event API with event id and payload', async () => {
    (createPayload as jest.Mock).mockReturnValue({ title: 'Test Meeting' });

    render(<UpdateMeetingForm existingEvent={mockedEvent} onForwardButtonClick={jest.fn()} />);

    fireEvent.submit(screen.getByRole('form'));
    await waitFor(() => {
      expect(mockUpdateEvent).toHaveBeenCalledWith({ eventId: mockedEvent.id, title: 'Test Meeting' });
    });
  });

  it('shows a success notification on successful event creation', async () => {
    mockUpdateEvent.mockImplementationOnce(() => ({
      unwrap: jest.fn().mockResolvedValue({ id: '123', title: 'Test Meeting' }),
    }));

    render(<UpdateMeetingForm existingEvent={mockedEvent} onForwardButtonClick={jest.fn()} />);

    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(notifications.success).toHaveBeenCalledWith('dashboard-meeting-notification-success-edit');
    });
  });

  it('shows an error notification on event creation failure', async () => {
    mockUpdateEvent.mockImplementationOnce(() => ({
      unwrap: jest.fn().mockRejectedValueOnce({ error: 'Error updating event' }),
    }));

    render(<UpdateMeetingForm existingEvent={mockedEvent} onForwardButtonClick={jest.fn()} />);

    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(notifications.error).toHaveBeenCalledWith('dashboard-meeting-notification-error');
    });
  });

  it('prevents multiple event update on multiple form submission', async () => {
    // If the mock resolves immediately, the test might fail, because
    // the first submission could complete before the second one is triggered,
    // and the createEvent mock will be calles twice
    mockUpdateEvent.mockImplementationOnce(() => ({
      unwrap: () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({ id: '123', title: 'Test Meeting' });
          }, 100);
        }),
    }));

    render(<UpdateMeetingForm existingEvent={mockedEvent} onForwardButtonClick={jest.fn()} />);

    // Trigger first submission
    fireEvent.submit(screen.getByRole('form'));

    // Immediately trigger second submission
    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(mockUpdateEvent).toHaveBeenCalledTimes(1);
    });
  });
});
