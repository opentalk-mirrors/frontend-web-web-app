// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen, waitFor } from '@testing-library/react';
import { useParams, useNavigate } from 'react-router-dom';

import { useLazyGetEventQuery } from '../../../api/rest';
import EditEventsPage from './EditEventsPage';

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock('../../../components/MeetingForms', () => ({
  __esModule: true,
  UpdateMeetingForm: ({ onForwardButtonClick }: { onForwardButtonClick: () => void }) => (
    <button data-testid="UpdateMeetingForm" onClick={onForwardButtonClick} />
  ),
}));

jest.mock('../../../components/InviteToMeeting', () => ({
  __esModule: true,
  default: () => <div data-testid="InviteToMeeting" />,
}));

jest.mock('../../../api/rest', () => ({
  useLazyGetEventQuery: jest.fn(),
}));

const mockUseParams = useParams as jest.Mock;
const mockUseLazyGetEventQuery = useLazyGetEventQuery as jest.Mock;
const mockLazyGetEvent = jest.fn();
const mockUseNavigate = useNavigate as jest.Mock;
const mockNavigate = jest.fn();

const mockEventId = 'db61b29b-b944-422d-b20f-6ed4158aad4d';

describe('EditEventsPage', () => {
  beforeEach(() => {
    // Since we are using 'resetMocks: true,' property globally, we have to redeclare return value on each run.
    mockUseParams.mockReturnValue({
      eventId: mockEventId,
      formStep: '0',
    });

    mockUseLazyGetEventQuery.mockReturnValue([mockLazyGetEvent, { data: {}, isLoading: false, error: null }]);

    mockUseNavigate.mockReturnValue(mockNavigate);
  });

  it('sets document title', () => {
    render(<EditEventsPage />);
    expect(document.title).toBe('dashboard-meetings-create-title in OpenTalk');
  });

  it('renders heading', () => {
    render(<EditEventsPage />);
    expect(screen.getByRole('heading', { name: 'dashboard-meetings-create-title', level: 1 })).toBeInTheDocument();
  });

  it('queries the event with the passed event id and default max inivitees number', async () => {
    render(<EditEventsPage />);

    await waitFor(() => {
      expect(mockLazyGetEvent).toHaveBeenCalledWith({
        eventId: mockEventId,
        inviteesMax: 10,
      });
    });
  });

  it('renders update meeting form when active step is 0', () => {
    render(<EditEventsPage />);

    expect(screen.getByTestId('UpdateMeetingForm')).toBeInTheDocument();
    expect(screen.queryByTestId('InviteToMeeting')).not.toBeInTheDocument();
  });

  it('renders invite to meeting form when active step is 1', () => {
    mockUseParams.mockReturnValue({
      eventId: mockEventId,
      formStep: '1',
    });

    render(<EditEventsPage />);

    expect(screen.queryByTestId('UpdateMeetingForm')).not.toBeInTheDocument();
    expect(screen.getByTestId('InviteToMeeting')).toBeInTheDocument();
  });

  it('navigates to create page on error', () => {
    mockUseLazyGetEventQuery.mockReturnValue([
      mockLazyGetEvent,
      { data: null, isLoading: false, error: new Error('') },
    ]);

    render(<EditEventsPage />);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/meetings/create');
  });
});
