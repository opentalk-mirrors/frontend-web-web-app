// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { UserId, EventId } from '@opentalk/rest-api-rtk-query';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { configureStore, renderWithProviders } from '../../utils/testUtils';
import SelectParticipants from './SelectParticipants';

const mockOnChange = vi.fn();

const MOCK_USER_ME_ID = 'MOCK_USER_ID' as UserId;

const mockOtherUser = {
  id: 'SOME_OTHER_ID',
  firstname: 'Boba',
  lastname: 'Fett',
  email: 'b.fett@example.com',
  avatarUrl: 'some avatarUrl',
};

const mockFindLazyUsersQuery = vi.fn();

vi.mock('../../api/rest', async (importOriginal) => ({
  ...(await importOriginal()),
  useGetMeQuery: () => ({
    meId: MOCK_USER_ME_ID,
  }),
  useLazyFindUsersQuery: () => [
    mockFindLazyUsersQuery,
    {
      foundUsers: [mockOtherUser],
      isLoading: false,
    },
  ],
  useGetEventInvitesQuery: () => ({}),
}));

describe('SelectParticipants', () => {
  const { store } = configureStore();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.clearAllMocks();
  });

  const setupRender = () =>
    renderWithProviders(
      <SelectParticipants label="Test" onParticipantSelect={mockOnChange} eventId={'id' as EventId} />,
      { store, provider: { mui: true } }
    );

  it('will render without errors', () => {
    setupRender();
    expect(screen.getByTestId('SelectParticipants')).toBeInTheDocument();
  });

  it('does not send API request for less then 3 characters.', async () => {
    setupRender();
    const user = userEvent.setup();
    const input = screen.getByRole('combobox');
    await user.type(input, 'bo');

    await waitFor(() => expect(mockFindLazyUsersQuery).not.toHaveBeenCalled());
  });

  it('calls onParticipantSelect with the right values onClick search items', async () => {
    setupRender();
    const user = userEvent.setup();
    const autocomplete = screen.getByTestId('SelectParticipants');
    const input = within(autocomplete).getByLabelText('Test');
    expect(screen.queryByTestId('SelectedParticipant')).not.toBeInTheDocument();

    await user.type(input, 'boba');

    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
    const listbox = screen.getByRole('listbox');
    const firstOption = within(listbox).getByRole('option');
    await user.click(firstOption);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledExactlyOnceWith(mockOtherUser);
    });
  });
});
