// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '@testing-library/react';
import { useParams, useNavigate } from 'react-router-dom';

import { useLazyGetEventQuery } from '../../../api/rest';
import EditEventsPage from './EditEventsPage';

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock('../../../components/CreateOrUpdateMeetingForm', () => ({
  __esModule: true,
  default: ({ onForwardButtonClick }: { onForwardButtonClick: () => void }) => (
    <button data-testid="CreateOrUpdateMeetingForm" onClick={onForwardButtonClick} />
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
const mockUseNavigate = useNavigate as jest.Mock;
const mockNavigate = jest.fn();

describe('EditEventsPage', () => {
  beforeEach(() => {
    // Since we are using 'resetMocks: true,' property globally, we have to redeclare return value on each run.
    mockUseParams.mockReturnValue({
      eventId: null,
      formStep: '0',
    });

    mockUseLazyGetEventQuery.mockReturnValue([() => {}, { data: {}, isLoading: false, error: null }]);

    mockUseNavigate.mockReturnValue(mockNavigate);
  });

  it('renders page title', () => {
    render(<EditEventsPage />);

    expect(screen.getByText('dashboard-meetings-create-title')).toHaveProperty('tagName', 'H1');
  });

  it('renders CreateOrUpdateMeetingForm when active step is 0', () => {
    render(<EditEventsPage />);

    expect(screen.getByTestId('CreateOrUpdateMeetingForm')).toBeInTheDocument();
    expect(screen.queryByTestId('InviteToMeeting')).not.toBeInTheDocument();
  });

  it('renders InviteToMeeting when active step is 1', () => {
    mockUseParams.mockReturnValue({
      eventId: null,
      formStep: '1',
    });

    render(<EditEventsPage />);

    expect(screen.queryByTestId('CreateOrUpdateMeetingForm')).not.toBeInTheDocument();
    expect(screen.getByTestId('InviteToMeeting')).toBeInTheDocument();
  });

  it('navigates to create page on error', () => {
    mockUseLazyGetEventQuery.mockReturnValue([() => {}, { data: null, isLoading: false, error: new Error('') }]);

    render(<EditEventsPage />);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/meetings/create');
  });
});
