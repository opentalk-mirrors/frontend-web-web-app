// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { UserId, EventId } from '@opentalk/rest-api-rtk-query';
import { screen, fireEvent, waitFor, within } from '@testing-library/react';

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

  const setup = () => {
    renderWithProviders(
      <SelectParticipants label="Test" onParticipantSelect={mockOnChange} eventId={'id' as EventId} />,
      { store }
    );
  };

  it('will render without errors', () => {
    setup();
    expect(screen.getByTestId('SelectParticipants')).toBeInTheDocument();
  });

  it.skip('sends API request after delay when typed more than 3 characters.', async () => {
    setup();
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(
      () => {
        expect(mockFindLazyUsersQuery).toHaveBeenCalled();
      },
      { timeout: 400 }
    );
  });

  it.skip('click on suggested participant will move him to added list', async () => {
    setup();
    const autocomplete = screen.getByTestId('SelectParticipants');
    const input = within(autocomplete).getByLabelText('Test');
    expect(screen.queryByTestId('SelectedParticipant')).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'test' } });

    const listbox = screen.getByRole('listbox');
    const firstOption = within(listbox).getByRole('option');
    fireEvent.click(firstOption);

    expect(screen.getByTestId('SelectedParticipant')).not.toBeEmptyDOMElement();
  });

  it.skip('click on delete will move the user back to the suggested list', async () => {
    setup();
    const autocomplete = screen.getByTestId('SelectParticipants');
    const input = within(autocomplete).getByLabelText('Test');

    fireEvent.change(input, { target: { value: 'test' } });

    const listbox = screen.getByRole('listbox');
    const firstOption = within(listbox).getByRole('option');
    fireEvent.click(firstOption);

    const selectedContainer = screen.getByTestId('SelectedParticipant');
    const firstChipDeleteButton = within(selectedContainer).getByTestId('SelectedParticipants-deleteButton');

    fireEvent.click(firstChipDeleteButton);

    expect(screen.queryByTestId('SelectedParticipant')).not.toBeInTheDocument();
  });
});
