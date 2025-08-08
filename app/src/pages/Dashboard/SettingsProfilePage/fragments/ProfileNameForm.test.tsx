// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { waitFor, screen, fireEvent } from '@testing-library/react';

import { configureStore, renderWithProviders } from '../../../../utils/testUtils';
import ProfileNameForm from './ProfileNameForm';

const mockUpdateMe = vi.fn();

const MOCK_DISPLAY_NAME = 'Test User';

const mockSuccessNotification = vi.fn();
const mockErrorNotification = vi.fn();
vi.mock('../../../../commonComponents/Notistack/fragments/utils', () => ({
  ...vi.importActual('../../../../commonComponents/Notistack/fragments/utils'),
  notifications: {
    success: (key: string) => mockSuccessNotification(key),
    error: (key: string) => mockErrorNotification(key),
  },
}));

vi.mock('../../../../api/rest', async (importOriginal) => ({
  ...(await importOriginal()),
  useGetMeQuery: () => ({
    data: {
      displayName: MOCK_DISPLAY_NAME,
      avatarUrl: 'TestURL',
    },
  }),
  useUpdateMeMutation: () => [
    mockUpdateMe,
    {
      isLoading: false,
    },
  ],
}));

describe('ProfileNameForm', () => {
  beforeEach(() => {
    mockUpdateMe.mockReturnValue({
      unwrap: () => Promise.resolve(),
    });
    vi.clearAllMocks();
  });

  it('renders without crash', () => {
    const { store } = configureStore();
    renderWithProviders(<ProfileNameForm />, { store });

    expect(screen.getByRole('textbox', { name: 'dashboard-settings-profile-name-label' })).toBeInTheDocument();
  });

  it('shows error on empty display name', async () => {
    const { store } = configureStore();
    renderWithProviders(<ProfileNameForm />, { store });

    expect(screen.queryByText(/field-error-required/i)).not.toBeInTheDocument();

    const input = screen.getByDisplayValue(MOCK_DISPLAY_NAME);
    fireEvent.change(input, { target: { value: '' } });

    await waitFor(() => {
      expect(screen.getByText(/field-error-required/i)).toBeInTheDocument();
    });
  });

  it('triggers update on submit button', async () => {
    const { store } = configureStore();
    renderWithProviders(<ProfileNameForm />, { store });

    expect(mockUpdateMe).toHaveBeenCalledTimes(0);

    const submitButton = screen.getByText('dashboard-settings-profile-button-save');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSuccessNotification).toHaveBeenCalledTimes(1);
    });
  });

  it('does not trigger update on save button if form input is invalid', async () => {
    const { store } = configureStore();
    renderWithProviders(<ProfileNameForm />, { store });

    expect(mockUpdateMe).toHaveBeenCalledTimes(0);

    const input = screen.getByDisplayValue(MOCK_DISPLAY_NAME);
    const submitButton = screen.getByText('dashboard-settings-profile-button-save');
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateMe).toHaveBeenCalledTimes(0);
    });
  });

  it('triggers success notification', async () => {
    const { store } = configureStore();
    renderWithProviders(<ProfileNameForm />, { store });

    const submitButton = screen.getByText('dashboard-settings-profile-button-save');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSuccessNotification).toHaveBeenCalledTimes(1);
    });
  });

  it('triggers error notification', async () => {
    mockUpdateMe.mockReturnValueOnce({
      unwrap: () => Promise.reject(),
    });

    const { store } = configureStore();
    renderWithProviders(<ProfileNameForm />, { store });

    const submitButton = screen.getByText('dashboard-settings-profile-button-save');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockErrorNotification).toHaveBeenCalledTimes(1);
    });
  });
});
