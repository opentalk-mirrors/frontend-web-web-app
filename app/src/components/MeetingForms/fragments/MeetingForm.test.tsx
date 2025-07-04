// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Tariff, TariffId, SingleEvent } from '@opentalk/rest-api-rtk-query';
import { screen, fireEvent, waitFor } from '@testing-library/react';

import { renderWithProviders, configureStore, mockedSingleEvent } from '../../../utils/testUtils';
import { defaultValues } from '../utils/initialValues';
import { MeetingFormValues } from './DashboardDateTimePicker';
import MeetingForm from './MeetingForm';

const defaultTariff: Tariff = {
  id: 'mockedTariffId' as TariffId,
  name: 'Mocked Tariff',
  modules: { recording: { features: [] } },
  quotas: {},
};

let mockTariff: Tariff;
let mockGetEvents: jest.MockedFunction<() => SingleEvent[]>;
jest.mock('../../../api/rest', () => ({
  ...jest.requireActual('../../../api/rest'),
  useLazyGetEventsQuery: () => [mockGetEvents],
  useGetMeTariffQuery: () => ({
    data: mockTariff,
  }),
}));

jest.mock('./DateTimeSection', () => ({
  __esModule: true,
  default: () => <div data-testid="date-time-section" />,
}));

jest.mock('./ActionButtons', () => ({
  __esModule: true,
  default: () => <div data-testid="action-buttons" />,
}));

jest.mock('./StreamingOptions', () => ({
  __esModule: true,
  default: () => <div data-testid="streaming-options" />,
}));

jest.mock('./TrainingParticipationReportSelect/TrainingParticipationReportSelect', () => ({
  __esModule: true,
  TrainingParticipationReportSelect: () => <div data-testid="training-participation-report-select" />,
}));

jest.mock('./EventConflictDialog', () => ({
  __esModule: true,
  default: ({ onConfirm }: { onConfirm: () => void }) => (
    <div data-testid="event-conflict-dialog">
      <button onClick={onConfirm} aria-label="confirm-conflict"></button>
    </div>
  ),
}));

jest.mock('./meetingFormValidationSchema', () => ({
  meetingFormValidationSchema: {
    // Will always return validation success
    validate: () => Promise.resolve(),
  },
}));

let mockInitialValues: Partial<MeetingFormValues>;
jest.mock('../utils/initialValues', () => ({
  ...jest.requireActual('../utils/initialValues'),
  getInitialValues: () => mockInitialValues,
}));

let mockOverlappingEvent: SingleEvent | undefined;
jest.mock('../../../utils/eventUtils', () => ({
  ...jest.requireActual('../../../utils/eventUtils'),
  findOverlappingEvent: () => mockOverlappingEvent,
}));

describe('MeetingForm', () => {
  const onSubmit = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    mockTariff = defaultTariff;
    mockInitialValues = defaultValues;
    mockGetEvents = jest.fn().mockReturnValue({});
    jest.clearAllMocks();
  });

  it('renders all main fields and sections', () => {
    const { store } = configureStore({});
    renderWithProviders(<MeetingForm onSubmit={onSubmit} eventIsLoading={false} />, { store });
    expect(screen.getByRole('form', { name: 'dashboard-meeting-create-form-title' })).toBeInTheDocument();

    expect(screen.getAllByRole('textbox')).toHaveLength(3); // Title, Details, Password
    expect(screen.getByRole('textbox', { name: 'dashboard-meeting-textfield-title' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'dashboard-meeting-textfield-details' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'dashboard-direct-meeting-password-label' })).toBeInTheDocument();

    expect(screen.getAllByRole('checkbox')).toHaveLength(3); // Date/Time, Waiting Room, Details
    expect(screen.getByRole('checkbox', { name: 'dashboard-meeting-date-and-time-switch' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'dashboard-meeting-waiting-room-switch' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'dashboard-meeting-details-tooltip' })).toBeInTheDocument();

    expect(screen.getByTestId('date-time-section')).toBeInTheDocument();
    expect(screen.getByTestId('action-buttons')).toBeInTheDocument();
    expect(screen.queryByTestId('streaming-options')).not.toBeInTheDocument();
    expect(screen.queryByTestId('training-participation-report-select')).not.toBeInTheDocument();

    expect(screen.queryByTestId('event-conflict-dialog')).not.toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('renders shared folder switch when shared folder feature is enabled', () => {
      const { store } = configureStore({
        initialState: {
          config: {
            settings: {
              waitingRoomDefaultValue: false,
            },
            features: {
              sharedFolder: true,
              e2eEncryption: false,
            },
          },
        },
      });
      renderWithProviders(<MeetingForm onSubmit={onSubmit} eventIsLoading={false} />, { store });
      expect(screen.getAllByRole('checkbox')).toHaveLength(4); // default + shared folder
      expect(screen.getByRole('checkbox', { name: 'dashboard-meeting-shared-folder-switch' })).toBeInTheDocument();
    });
    it('renders streaming options section if streaming feature is enabled', () => {
      const { store } = configureStore({});
      mockTariff = { ...defaultTariff, modules: { recording: { features: ['stream'] } } };
      renderWithProviders(<MeetingForm onSubmit={onSubmit} eventIsLoading={false} />, { store });
      expect(screen.getByTestId('streaming-options')).toBeInTheDocument();
    });
    it('renders training participation selection if streaming feature is enabled', () => {
      const { store } = configureStore({});
      mockTariff = { ...defaultTariff, modules: { trainingParticipationReport: { features: [] } } };
      renderWithProviders(<MeetingForm onSubmit={onSubmit} eventIsLoading={false} />, { store });
      expect(screen.getByTestId('training-participation-report-select')).toBeInTheDocument();
    });
    it('renders e2e encryption switch when e2e encryption feature is enabled', () => {
      const { store } = configureStore({
        initialState: {
          config: {
            settings: {
              waitingRoomDefaultValue: false,
            },
            features: {
              sharedFolder: false,
              e2eEncryption: true,
            },
          },
        },
      });
      renderWithProviders(<MeetingForm onSubmit={onSubmit} eventIsLoading={false} />, { store });
      expect(screen.getAllByRole('checkbox')).toHaveLength(4); // default + e2e encryption
      expect(screen.getByRole('checkbox', { name: 'dashboard-meeting-e2ee-tooltip' })).toBeInTheDocument();
    });
  });

  describe('form submit', () => {
    it('submits if the meeting is time independent', async () => {
      const { store } = configureStore({});
      renderWithProviders(<MeetingForm onSubmit={onSubmit} eventIsLoading={false} />, { store });

      const timeSwitch = screen.getByRole('checkbox', { name: 'dashboard-meeting-date-and-time-switch' });
      fireEvent.click(timeSwitch);

      await waitFor(() => {
        expect(timeSwitch).not.toBeChecked();
      });

      fireEvent.submit(screen.getByRole('form'));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });
    });

    it('fetches events with same start and end date if meeting is time dependent', async () => {
      const mockStartDate = new Date('2023-10-01T10:00:00Z').toISOString();
      const mockEndDate = new Date('2023-10-01T10:30:00Z').toISOString();
      mockInitialValues = { ...defaultValues, startDate: mockStartDate, endDate: mockEndDate };

      const { store } = configureStore({});
      renderWithProviders(<MeetingForm onSubmit={onSubmit} eventIsLoading={false} />, { store });

      const timeSwitch = screen.getByRole('checkbox', { name: 'dashboard-meeting-date-and-time-switch' });
      expect(timeSwitch).toBeChecked();

      fireEvent.submit(screen.getByRole('form'));

      await waitFor(() => {
        expect(mockGetEvents).toHaveBeenCalledWith({ timeMin: mockStartDate, timeMax: mockEndDate });
      });
    });

    it('submits if the meeting is time dependent and has no overlapping events', async () => {
      const mockStartDate = new Date('2023-10-01T10:00:00Z').toISOString();
      const mockEndDate = new Date('2023-10-01T10:30:00Z').toISOString();
      mockInitialValues = { ...defaultValues, startDate: mockStartDate, endDate: mockEndDate };

      mockOverlappingEvent = undefined;

      const { store } = configureStore({});
      renderWithProviders(<MeetingForm onSubmit={onSubmit} eventIsLoading={false} />, { store });

      const timeSwitch = screen.getByRole('checkbox', { name: 'dashboard-meeting-date-and-time-switch' });
      expect(timeSwitch).toBeChecked();

      fireEvent.submit(screen.getByRole('form'));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });
    });

    it('renders conflict dialog if the meeting is time dependent and there are overlapping events', async () => {
      const mockStartDate = new Date('2023-10-01T10:00:00Z').toISOString();
      const mockEndDate = new Date('2023-10-01T10:30:00Z').toISOString();
      mockInitialValues = { ...defaultValues, startDate: mockStartDate, endDate: mockEndDate };

      mockOverlappingEvent = mockedSingleEvent;
      mockGetEvents = jest.fn().mockReturnValue({ data: mockedSingleEvent });

      const { store } = configureStore({});
      renderWithProviders(<MeetingForm onSubmit={onSubmit} eventIsLoading={false} />, { store });

      const timeSwitch = screen.getByRole('checkbox', { name: 'dashboard-meeting-date-and-time-switch' });
      expect(timeSwitch).toBeChecked();

      fireEvent.submit(screen.getByRole('form'));

      await waitFor(() => {
        expect(onSubmit).not.toHaveBeenCalled();
      });

      expect(screen.getByTestId('event-conflict-dialog')).toBeInTheDocument();
    });

    it('submits form on conflict confirm', async () => {
      const mockStartDate = new Date('2023-10-01T10:00:00Z').toISOString();
      const mockEndDate = new Date('2023-10-01T10:30:00Z').toISOString();
      mockInitialValues = { ...defaultValues, startDate: mockStartDate, endDate: mockEndDate };

      mockOverlappingEvent = mockedSingleEvent;
      mockGetEvents = jest.fn().mockReturnValue({ data: mockedSingleEvent });

      const { store } = configureStore({});
      renderWithProviders(<MeetingForm onSubmit={onSubmit} eventIsLoading={false} />, { store });

      const timeSwitch = screen.getByRole('checkbox', { name: 'dashboard-meeting-date-and-time-switch' });
      expect(timeSwitch).toBeChecked();

      fireEvent.submit(screen.getByRole('form'));

      await waitFor(() => {
        expect(onSubmit).not.toHaveBeenCalled();
      });

      const confirmButton = screen.getByRole('button', { name: 'confirm-conflict' });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });
    });
  });
});
