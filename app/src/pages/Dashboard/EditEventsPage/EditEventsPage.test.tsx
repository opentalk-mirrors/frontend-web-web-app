// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, waitFor } from '@testing-library/react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mock } from 'vitest';

import { useLazyGetEventQuery } from '../../../api/rest';
import { configureStore, renderWithProviders } from '../../../utils/testUtils';
import EditEventsPage from './EditEventsPage';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  useParams: vi.fn(),
}));

vi.mock('../../../components/MeetingForms', () => ({
  __esModule: true,
  UpdateMeetingForm: ({ onForwardButtonClick }: { onForwardButtonClick: () => void }) => (
    <button data-testid="UpdateMeetingForm" onClick={onForwardButtonClick} />
  ),
}));

vi.mock('../../../components/InviteToMeeting', () => ({
  __esModule: true,
  default: () => <div data-testid="InviteToMeeting" />,
}));

vi.mock('../../../api/rest', async () => ({
  ...(await vi.importActual('../../../api/rest')),
  useLazyGetEventQuery: vi.fn(),
}));

const mockUseParams = useParams as Mock;
const mockUseLazyGetEventQuery = useLazyGetEventQuery as Mock;
const mockLazyGetEvent = vi.fn();
const mockUseNavigate = useNavigate as Mock;
const mockNavigate = vi.fn();

const mockEventId = 'db61b29b-b944-422d-b20f-6ed4158aad4d';

const { store } = configureStore();

describe('EditEventsPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Since we are using 'resetMocks: true,' property globally, we have to redeclare return value on each run.
    mockUseParams.mockReturnValue({
      eventId: mockEventId,
      formStep: '0',
    });

    mockUseLazyGetEventQuery.mockReturnValue([mockLazyGetEvent, { data: {}, isLoading: false, error: null }]);

    mockUseNavigate.mockReturnValue(mockNavigate);
  });

  it('sets document title', () => {
    renderWithProviders(<EditEventsPage />, { store, provider: { mui: true } });
    expect(document.title).toBe('dashboard-meetings-create-title in OpenTalk');
  });

  it('renders heading', () => {
    renderWithProviders(<EditEventsPage />, { store, provider: { mui: true } });
    expect(screen.getByRole('heading', { name: 'dashboard-meetings-create-title', level: 1 })).toBeInTheDocument();
  });

  it('queries the event with the passed event id and default max inivitees number', async () => {
    renderWithProviders(<EditEventsPage />, { store, provider: { mui: true } });

    await waitFor(() => {
      expect(mockLazyGetEvent).toHaveBeenCalledExactlyOnceWith({
        eventId: mockEventId,
        inviteesMax: 10,
      });
    });
  });

  it('renders update meeting form when active step is 0', () => {
    renderWithProviders(<EditEventsPage />, { store, provider: { mui: true } });

    expect(screen.getByTestId('UpdateMeetingForm')).toBeInTheDocument();
    expect(screen.queryByTestId('InviteToMeeting')).not.toBeInTheDocument();
  });

  it('renders invite to meeting form when active step is 1', () => {
    mockUseParams.mockReturnValue({
      eventId: mockEventId,
      formStep: '1',
    });

    renderWithProviders(<EditEventsPage />, { store, provider: { mui: true } });

    expect(screen.queryByTestId('UpdateMeetingForm')).not.toBeInTheDocument();
    expect(screen.getByTestId('InviteToMeeting')).toBeInTheDocument();
  });

  it('navigates to create page on error', () => {
    mockUseLazyGetEventQuery.mockReturnValue([
      mockLazyGetEvent,
      { data: null, isLoading: false, error: new Error('') },
    ]);

    renderWithProviders(<EditEventsPage />, { store, provider: { mui: true } });

    expect(mockNavigate).toHaveBeenCalledExactlyOnceWith('/dashboard/meetings/create');
  });
});
