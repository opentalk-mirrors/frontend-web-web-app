// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { UserId, EventId } from '@opentalk/rest-api-rtk-query';
import { cleanup, screen, fireEvent, waitFor, within } from '@testing-library/react';

import { configureStore, renderWithProviders } from '../../utils/testUtils';
import SelectParticipants from './SelectParticipants';

const mockOnChange = jest.fn();

const MOCK_USER_ME_ID = 'MOCK_USER_ID' as UserId;

const mockOtherUser = {
  id: 'SOME_OTHER_ID',
  firstname: 'Boba',
  lastname: 'Fett',
  avatarUrl: 'some avatarUrl',
};

const mockFindLazyUsersQuery = jest.fn();

jest.mock('../../api/rest', () => ({
  ...jest.requireActual('../../api/rest'),
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

// Todo UNIT TESTS SelectParticipants rendered twice and deletes the input for some reason, component and tests needs to be fixed
describe('SelectParticipants', () => {
  const { store } = configureStore();

  beforeEach(() => {
    renderWithProviders(
      <SelectParticipants label="Test" onParticipantSelect={mockOnChange} eventId={'id' as EventId} />,
      { store }
    );
  });

  afterEach(() => cleanup());

  test('will render without errors', () => {
    expect(screen.getByTestId('SelectParticipants')).toBeInTheDocument();
  });

  test.skip('sends API request after delay when typed more than 3 characters.', async () => {
    await waitFor(() => {
      const input = screen.getByRole('combobox');
      fireEvent.change(input, { target: { value: 'test' } });
    });

    await waitFor(
      () => {
        expect(mockFindLazyUsersQuery).toHaveBeenCalled();
      },
      { timeout: 400 }
    );
  });

  test.skip('click on suggested participant will move him to added list', async () => {
    const autocomplete = screen.getByTestId('SelectParticipants');
    const input = within(autocomplete).getByLabelText('Test');
    expect(screen.queryByTestId('SelectedParticipant')).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(() => {
      const listbox = screen.getByRole('listbox');
      const firstOption = within(listbox).getByRole('option');
      fireEvent.click(firstOption);
    });

    expect(screen.getByTestId('SelectedParticipant')).not.toBeEmptyDOMElement();
  });

  test.skip('click on delete will move the user back to the suggested list', async () => {
    const autocomplete = screen.getByTestId('SelectParticipants');
    const input = within(autocomplete).getByLabelText('Test');

    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(() => {
      const listbox = screen.getByRole('listbox');
      const firstOption = within(listbox).getByRole('option');
      fireEvent.click(firstOption);
    });

    const selectedContainer = screen.getByTestId('SelectedParticipant');
    const firstChipDeleteButton = within(selectedContainer).getByTestId('SelectedParticipants-deleteButton');

    fireEvent.click(firstChipDeleteButton);

    expect(screen.queryByTestId('SelectedParticipant')).not.toBeInTheDocument();
  });
});
