// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { CoreFeatures, Tariff, TariffId, SingleEvent } from '@opentalk/rest-api-rtk-query';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedFunction } from 'vitest';

import { renderWithProviders, configureStore, mockedSingleEvent } from '../../../utils/testUtils';
import { defaultValues } from '../utils/initialValues';
import { MeetingFormValues } from './DashboardDateTimePicker';
import MeetingForm from './MeetingForm';

const defaultTariff: Tariff = {
  id: 'mockedTariffId' as TariffId,
  name: 'Mocked Tariff',
  modules: { recording: { features: [] }, core: { features: [CoreFeatures.GuestsAllowed] } },
  quotas: {},
};

let mockTariff: Tariff;
let mockGetEventsWithInstances: MockedFunction<() => SingleEvent[]>;
let mockCheckAlias: MockedFunction<(payload: { name: string }) => void>;
let mockAliasResult: Record<string, unknown>;
vi.mock('../../../api/rest', async (importOriginal) => ({
  ...(await importOriginal()),
  useLazyGetEventsWithInstancesQuery: () => [mockGetEventsWithInstances],
  useGetMeTariffQuery: () => ({
    data: mockTariff,
  }),
  useVerifyRoomNameMutation: () => [mockCheckAlias, mockAliasResult],
}));

vi.mock('./DateTimeSection', () => ({
  __esModule: true,
  default: () => <div data-testid="date-time-section" />,
}));

vi.mock('./ActionButtons', () => ({
  __esModule: true,
  default: () => <div data-testid="action-buttons" />,
}));

vi.mock('./StreamingOptions', () => ({
  __esModule: true,
  default: () => <div data-testid="streaming-options" />,
}));

vi.mock('./TrainingParticipationReportSelect/TrainingParticipationReportSelect', () => ({
  __esModule: true,
  TrainingParticipationReportSelect: () => <div data-testid="training-participation-report-select" />,
}));

vi.mock('./EventConflictDialog', () => ({
  __esModule: true,
  default: ({ onConfirm }: { onConfirm: () => void }) => (
    <div data-testid="event-conflict-dialog">
      <button onClick={onConfirm} aria-label="confirm-conflict"></button>
    </div>
  ),
}));

vi.mock('./meetingFormValidationSchema', () => ({
  meetingFormValidationSchema: {
    // Will always return validation success
    validate: () => Promise.resolve(),
  },
}));

let mockInitialValues: Partial<MeetingFormValues>;
vi.mock('../utils/initialValues', async (importOriginal) => ({
  ...(await importOriginal()),
  getInitialValues: () => mockInitialValues,
}));

let mockOverlappingEvent: SingleEvent | undefined;
vi.mock('../../../utils/eventUtils', async (importOriginal) => ({
  ...(await importOriginal()),
  findOverlappingEvent: () => mockOverlappingEvent,
}));

describe('MeetingForm', () => {
  const onSubmit = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    mockTariff = defaultTariff;
    mockInitialValues = defaultValues;
    mockGetEventsWithInstances = vi.fn().mockReturnValue({});
    mockCheckAlias = vi.fn();
    mockAliasResult = { isUninitialized: true };
    vi.clearAllMocks();
  });

  it('renders all main fields and sections', () => {
    const { store } = configureStore({});
    renderWithProviders(<MeetingForm onSubmit={onSubmit} eventIsLoading={false} />, { store, provider: { mui: true } });
    expect(screen.getByRole('form', { name: 'dashboard-meeting-create-form-title' })).toBeInTheDocument();

    expect(screen.getAllByRole('textbox')).toHaveLength(3); // Title, Details, Password
    expect(screen.getByRole('textbox', { name: 'dashboard-meeting-textfield-title' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'dashboard-meeting-textfield-details' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'dashboard-direct-meeting-password-label' })).toBeInTheDocument();

    expect(screen.getAllByRole('switch')).toHaveLength(4); // Date/Time, Details, Guest access
    expect(screen.getByRole('switch', { name: 'dashboard-meeting-date-and-time-switch' })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'dashboard-meeting-details-tooltip' })).toBeInTheDocument();

    expect(screen.getByRole('group', { name: 'dashboard-meeting-waiting-room-switch' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'global-off' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'global-for-all' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'global-for-guests' })).toBeInTheDocument();

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
              e2eEncryption: false,
            },
          },
        },
      });
      mockTariff = {
        ...defaultTariff,
        modules: { sharedFolder: { features: [] }, core: { features: [CoreFeatures.GuestsAllowed] } },
      };
      renderWithProviders(<MeetingForm onSubmit={onSubmit} eventIsLoading={false} />, {
        store,
        provider: { mui: true },
      });
      expect(screen.getAllByRole('switch')).toHaveLength(5); // default + shared folder
      expect(screen.getByRole('switch', { name: 'dashboard-meeting-shared-folder-switch' })).toBeInTheDocument();
    });
    it('renders streaming options section if streaming feature is enabled', () => {
      const { store } = configureStore({});
      mockTariff = { ...defaultTariff, modules: { recording: { features: ['stream'] } } };
      renderWithProviders(<MeetingForm onSubmit={onSubmit} eventIsLoading={false} />, {
        store,
        provider: { mui: true },
      });
      expect(screen.getByTestId('streaming-options')).toBeInTheDocument();
    });
    it('renders training participation selection if streaming feature is enabled', () => {
      const { store } = configureStore({});
      mockTariff = { ...defaultTariff, modules: { trainingParticipationReport: { features: [] } } };
      renderWithProviders(<MeetingForm onSubmit={onSubmit} eventIsLoading={false} />, {
        store,
        provider: { mui: true },
      });
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
              e2eEncryption: true,
            },
          },
        },
      });
      renderWithProviders(<MeetingForm onSubmit={onSubmit} eventIsLoading={false} />, {
        store,
        provider: { mui: true },
      });
      expect(screen.getAllByRole('switch')).toHaveLength(5); // default + e2e encryption
      expect(screen.getByRole('switch', { name: 'dashboard-meeting-e2ee-tooltip' })).toBeInTheDocument();
    });

    it('keeps the guest access switch available after enabling e2e encryption', async () => {
      const user = userEvent.setup();
      const { store } = configureStore({
        initialState: {
          config: {
            settings: {
              waitingRoomDefaultValue: false,
            },
            features: {
              e2eEncryption: true,
            },
          },
        },
      });
      renderWithProviders(<MeetingForm onSubmit={onSubmit} eventIsLoading={false} />, {
        store,
        provider: { mui: true },
      });

      expect(screen.getByRole('switch', { name: 'guest-access-switch-label' })).toBeInTheDocument();

      await user.click(screen.getByRole('switch', { name: 'dashboard-meeting-e2ee-tooltip' }));

      expect(screen.getByRole('switch', { name: 'dashboard-meeting-e2ee-tooltip' })).toBeChecked();
      expect(screen.getByRole('switch', { name: 'guest-access-switch-label' })).toBeInTheDocument();
    });

    it('hides the guest access switch when the tariff does not allow guests', () => {
      const { store } = configureStore({});
      mockTariff = { ...defaultTariff, modules: { recording: { features: [] } } };
      renderWithProviders(<MeetingForm onSubmit={onSubmit} eventIsLoading={false} />, {
        store,
        provider: { mui: true },
      });
      expect(screen.queryByRole('switch', { name: 'guest-access-switch-label' })).not.toBeInTheDocument();

      expect(screen.getByRole('button', { name: 'global-for-guests' })).toBeDisabled();
    });
  });

  describe('form submit', () => {
    it('submits if the meeting is time independent', async () => {
      const user = userEvent.setup();
      const { store } = configureStore({});
      renderWithProviders(<MeetingForm onSubmit={onSubmit} eventIsLoading={false} />, {
        store,
        provider: { mui: true },
      });

      const timeSwitch = screen.getByRole('switch', { name: 'dashboard-meeting-date-and-time-switch' });
      await user.click(timeSwitch);

      await waitFor(() => {
        expect(timeSwitch).not.toBeChecked();
      });

      fireEvent.submit(screen.getByRole('form'));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });
    });

    it('fetches events with instances with same start and end date if meeting is time dependent', async () => {
      const mockStartDate = new Date('2023-10-01T10:00:00Z').toISOString();
      const mockEndDate = new Date('2023-10-01T10:30:00Z').toISOString();
      mockInitialValues = { ...defaultValues, startDate: mockStartDate, endDate: mockEndDate };

      const { store } = configureStore({});
      renderWithProviders(<MeetingForm onSubmit={onSubmit} eventIsLoading={false} />, {
        store,
        provider: { mui: true },
      });

      const timeSwitch = screen.getByRole('switch', { name: 'dashboard-meeting-date-and-time-switch' });
      expect(timeSwitch).toBeChecked();

      fireEvent.submit(screen.getByRole('form'));

      await waitFor(() => {
        expect(mockGetEventsWithInstances).toHaveBeenCalledExactlyOnceWith({
          timeIndependent: false,
          instancesMax: 100,
          timeMin: mockStartDate,
          timeMax: mockEndDate,
        });
      });
    });

    it('submits if the meeting is time dependent and has no overlapping events', async () => {
      const mockStartDate = new Date('2023-10-01T10:00:00Z').toISOString();
      const mockEndDate = new Date('2023-10-01T10:30:00Z').toISOString();
      mockInitialValues = { ...defaultValues, startDate: mockStartDate, endDate: mockEndDate };

      mockOverlappingEvent = undefined;

      const { store } = configureStore({});
      renderWithProviders(<MeetingForm onSubmit={onSubmit} eventIsLoading={false} />, {
        store,
        provider: { mui: true },
      });

      const timeSwitch = screen.getByRole('switch', { name: 'dashboard-meeting-date-and-time-switch' });
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
      mockGetEventsWithInstances = vi.fn().mockReturnValue({ data: mockedSingleEvent });

      const { store } = configureStore({});
      renderWithProviders(<MeetingForm onSubmit={onSubmit} eventIsLoading={false} />, {
        store,
        provider: { mui: true },
      });

      const timeSwitch = screen.getByRole('switch', { name: 'dashboard-meeting-date-and-time-switch' });
      expect(timeSwitch).toBeChecked();

      fireEvent.submit(screen.getByRole('form'));

      await waitFor(() => {
        expect(onSubmit).not.toHaveBeenCalled();
      });

      expect(screen.getByTestId('event-conflict-dialog')).toBeInTheDocument();
    });

    it('submits form on conflict confirm', async () => {
      const user = userEvent.setup();
      const mockStartDate = new Date('2023-10-01T10:00:00Z').toISOString();
      const mockEndDate = new Date('2023-10-01T10:30:00Z').toISOString();
      mockInitialValues = { ...defaultValues, startDate: mockStartDate, endDate: mockEndDate };

      mockOverlappingEvent = mockedSingleEvent;
      mockGetEventsWithInstances = vi.fn().mockReturnValue({ data: mockedSingleEvent });

      const { store } = configureStore({});
      renderWithProviders(<MeetingForm onSubmit={onSubmit} eventIsLoading={false} />, {
        store,
        provider: { mui: true },
      });

      const timeSwitch = screen.getByRole('switch', { name: 'dashboard-meeting-date-and-time-switch' });
      expect(timeSwitch).toBeChecked();

      fireEvent.submit(screen.getByRole('form'));

      await waitFor(() => {
        expect(onSubmit).not.toHaveBeenCalled();
      });

      const confirmButton = screen.getByRole('button', { name: 'confirm-conflict' });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('personal room', () => {
    beforeEach(() => {
      mockInitialValues = { ...defaultValues, personalRoom: true };
    });

    const getPersonalRoomNameInput = () => {
      const { store } = configureStore({});
      renderWithProviders(<MeetingForm onSubmit={onSubmit} eventIsLoading={false} />, {
        store,
        provider: { mui: true },
      });
      return screen.getByRole('textbox', { name: 'dashboard-meeting-personal-room-name-label' });
    };

    it('debounces the availability check and fires it once after typing stops', async () => {
      const user = userEvent.setup();
      const input = getPersonalRoomNameInput();

      await user.type(input, 'abc');

      await waitFor(() => {
        expect(mockCheckAlias).toHaveBeenCalledTimes(1);
      });
      expect(mockCheckAlias).toHaveBeenCalledWith({ name: 'abc' });
    });

    it('does not trigger the availability check for names shorter than the minimum length', async () => {
      const user = userEvent.setup();
      const input = getPersonalRoomNameInput();

      await user.type(input, 'ab');

      expect(mockCheckAlias).not.toHaveBeenCalled();
    });

    it('shows invalid character feedback for disallowed characters', async () => {
      const user = userEvent.setup();
      const input = getPersonalRoomNameInput();

      await user.type(input, 'ab_');

      expect(screen.getByText('dashboard-meeting-personal-room-name-invalid-chars')).toBeInTheDocument();
    });

    it('auto-suggests the personal room name from the title as a slug', async () => {
      const user = userEvent.setup();
      getPersonalRoomNameInput();

      const titleInput = screen.getByRole('textbox', { name: 'dashboard-meeting-textfield-title' });
      await user.type(titleInput, 'Wöchentliches Meeting!');

      expect(screen.getByRole('textbox', { name: 'dashboard-meeting-personal-room-name-label' })).toHaveValue(
        'woechentliches-meeting'
      );
    });

    it('stops syncing the name from the title after a manual edit', async () => {
      const user = userEvent.setup();
      const nameInput = getPersonalRoomNameInput();
      const titleInput = screen.getByRole('textbox', { name: 'dashboard-meeting-textfield-title' });

      await user.type(titleInput, 'First');
      expect(nameInput).toHaveValue('first');

      await user.clear(nameInput);
      await user.type(nameInput, 'custom-name');
      await user.type(titleInput, 'Second Title');

      expect(nameInput).toHaveValue('custom-name');
    });

    it('does not overwrite a pre-filled name from an existing alias', async () => {
      const user = userEvent.setup();
      mockInitialValues = { ...defaultValues, personalRoom: true, personalRoomName: 'existing-room' };
      getPersonalRoomNameInput();

      const titleInput = screen.getByRole('textbox', { name: 'dashboard-meeting-textfield-title' });
      await user.type(titleInput, 'A New Title');

      expect(screen.getByRole('textbox', { name: 'dashboard-meeting-personal-room-name-label' })).toHaveValue(
        'existing-room'
      );
    });

    it('shows availability feedback once the result matches the current input', () => {
      mockAliasResult = { isSuccess: true, data: { available: true }, originalArgs: { name: 'abc' } };
      mockInitialValues = { ...defaultValues, personalRoom: true, personalRoomName: 'abc' };
      getPersonalRoomNameInput();

      expect(screen.getByText('dashboard-meeting-personal-room-name-available')).toBeInTheDocument();
    });

    it('shows taken feedback when the name is not available', () => {
      mockAliasResult = { isSuccess: true, data: { available: false }, originalArgs: { name: 'abc' } };
      mockInitialValues = { ...defaultValues, personalRoom: true, personalRoomName: 'abc' };
      getPersonalRoomNameInput();

      expect(screen.getByText('dashboard-meeting-personal-room-name-taken')).toBeInTheDocument();
    });

    it('marks the name field as invalid when the name is taken', () => {
      mockAliasResult = { isSuccess: true, data: { available: false }, originalArgs: { name: 'abc' } };
      mockInitialValues = { ...defaultValues, personalRoom: true, personalRoomName: 'abc' };
      const input = getPersonalRoomNameInput();

      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('shows a character counter in the x/max format', async () => {
      const user = userEvent.setup();
      const input = getPersonalRoomNameInput();

      await user.type(input, 'abc');

      expect(screen.getByText('3/40')).toBeInTheDocument();
    });

    it('shows the checking state while a check is pending for the typed value', async () => {
      const user = userEvent.setup();
      mockAliasResult = { isSuccess: true, data: { available: true }, originalArgs: { name: 'abc' } };
      const input = getPersonalRoomNameInput();

      await user.type(input, 'abcd');

      expect(screen.getByText('dashboard-meeting-personal-room-name-checking')).toBeInTheDocument();
    });

    it('does not get stuck on checking for a name pre-filled from an existing alias', () => {
      mockAliasResult = { isUninitialized: true };
      mockInitialValues = { ...defaultValues, personalRoom: true, personalRoomName: 'existing-room' };
      getPersonalRoomNameInput();

      expect(screen.queryByText('dashboard-meeting-personal-room-name-checking')).not.toBeInTheDocument();
    });
  });
});
