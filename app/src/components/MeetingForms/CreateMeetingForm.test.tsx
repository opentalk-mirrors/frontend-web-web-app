// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';

import { useCreateEventMutation } from '../../api/rest';
import { notifications } from '../../commonComponents';
import CreateMeetingForm from './CreateMeetingForm';
import { MeetingFormValues } from './fragments/DashboardDateTimePicker';
import { createPayload } from './utils/payloadUtils';

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

jest.mock('../../api/rest', () => ({
  useCreateEventMutation: jest.fn(),
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
  }: {
    onSubmit: (values: Partial<MeetingFormValues>) => void;
    eventIsLoading: boolean;
  }) => {
    const mockValues = { title: 'Test Meeting' };
    return (
      <form
        aria-label="MeetingForm"
        data-event-is-loading={eventIsLoading}
        onSubmit={(e) => {
          e.preventDefault(); // Prevent default form submission
          onSubmit(mockValues);
        }}
      />
    );
  },
}));

describe('CreateMeetingForm', () => {
  const mockNavigate = jest.fn();
  const mockCreateEvent = jest.fn();

  beforeEach(() => {
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useCreateEventMutation as jest.Mock).mockReturnValue([mockCreateEvent, { isLoading: false }]);
    jest.clearAllMocks();
  });

  it('renders the MeetingForm component', () => {
    render(<CreateMeetingForm />);

    expect(screen.getByRole('form', { name: 'MeetingForm' })).toBeInTheDocument();
  });

  it('receives form values for creating a payload on form submission', async () => {
    render(<CreateMeetingForm />);

    fireEvent.submit(screen.getByRole('form'));
    await waitFor(() => {
      expect(createPayload).toHaveBeenCalledWith({ title: 'Test Meeting' });
    });
  });

  it('triggers event creation with proper payload on form submission', async () => {
    const mockPayload = { title: 'Test Meeting Payload' };
    (createPayload as jest.Mock).mockReturnValue(mockPayload);

    render(<CreateMeetingForm />);

    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(mockCreateEvent).toHaveBeenCalledWith(mockPayload);
    });
  });

  it('shows a success notification on successful event creation', async () => {
    mockCreateEvent.mockImplementationOnce(() => ({
      unwrap: jest.fn().mockResolvedValue({ id: '123', title: 'Test Meeting' }),
    }));

    render(<CreateMeetingForm />);

    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(notifications.success).toHaveBeenCalledWith('dashboard-meeting-notification-success-create');
    });
  });

  it('navigates to update page with event id on successful event creation', async () => {
    const mockEventId = '123';
    mockCreateEvent.mockImplementationOnce(() => ({
      unwrap: jest.fn().mockResolvedValue({ id: mockEventId, title: 'Test Meeting' }),
    }));

    render(<CreateMeetingForm />);

    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(`/dashboard/meetings/update/${mockEventId}/1`, expect.any(Object));
    });
  });

  it('shows an error notification on event creation failure', async () => {
    mockCreateEvent.mockImplementationOnce(() => ({
      unwrap: jest.fn().mockRejectedValueOnce({ error: 'Error creating event' }),
    }));

    render(<CreateMeetingForm />);

    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(notifications.error).toHaveBeenCalledWith('dashboard-meeting-notification-error');
    });
  });

  it('prevents duplicate event creation on multiple form submission', async () => {
    // If the mock resolves immediately, the test might fail, because
    // the first submission could complete before the second one is triggered,
    // and the createEvent mock will be calles twice
    mockCreateEvent.mockImplementationOnce(() => ({
      unwrap: () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({ id: '123', title: 'Test Meeting' });
          }, 100);
        }),
    }));

    render(<CreateMeetingForm />);

    // Trigger first submission
    fireEvent.submit(screen.getByRole('form'));

    // Immediately trigger second submission
    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(mockCreateEvent).toHaveBeenCalledTimes(1);
    });
  });

  it('passes the loading state of event to the child MeetingForm', () => {
    (useCreateEventMutation as jest.Mock).mockReturnValue([jest.fn(), { isLoading: true }]);

    render(<CreateMeetingForm />);

    const meetingForm = screen.getByRole('form');
    expect(meetingForm).toHaveAttribute('data-event-is-loading', 'true');
  });
});
