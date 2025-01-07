// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { UserId, EventId } from '@opentalk/rest-api-rtk-query';

import { cleanup, configureStore, render, screen, fireEvent, waitFor, within } from '../../utils/testUtils';
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

describe('SelectParticipants', () => {
  const { store } = configureStore();

  beforeEach(async () => {
    await render(
      <SelectParticipants label="Test" onParticipantSelect={mockOnChange} eventId={'id' as EventId} />,
      store
    );
  });

  afterEach(() => cleanup());

  test('will render without errors', async () => {
    expect(screen.getByTestId('SelectParticipants')).toBeInTheDocument();
  });

  test('sends API request after delay when typed more than 3 characters.', async () => {
    const autocomplete = screen.getByTestId('SelectParticipants');
    const input = within(autocomplete).getByLabelText('Test');

    fireEvent.change(input, { target: { value: 'test' } });
    waitFor(
      () => {
        expect(mockFindLazyUsersQuery).toHaveBeenCalled();
      },
      { timeout: 500 }
    );
  });

  test('click on suggested participant will move him to added list', async () => {
    const autocomplete = screen.getByTestId('SelectParticipants');
    const input = within(autocomplete).getByLabelText('Test');
    expect(screen.queryByTestId('SelectedParticipant')).not.toBeInTheDocument();
    fireEvent.change(input, { target: { value: 'test' } });
    waitFor(
      async () => {
        const listbox = screen.getByRole('listbox');
        const firstOption = within(listbox).getByRole('option');
        fireEvent.click(firstOption);
        expect(screen.getByTestId('SelectedParticipant')).not.toBeEmptyDOMElement();
      },
      { timeout: 500 }
    );
  });

  test('click on delete will move the user back to the suggested list', async () => {
    const autocomplete = screen.getByTestId('SelectParticipants');
    const input = within(autocomplete).getByLabelText('Test');
    fireEvent.change(input, { target: { value: 'test' } });
    waitFor(
      async () => {
        const listbox = screen.getByRole('listbox');
        const firstOption = within(listbox).getByRole('option');
        fireEvent.click(firstOption);
        const selectedContainer = screen.getByTestId('SelectedParticipant');
        const firstChipDeleteButton = within(selectedContainer).getByTestId('SelectedParticipants-deleteButton');
        fireEvent.click(firstChipDeleteButton);
        expect(screen.queryByTestId('SelectedParticipant')).not.toBeInTheDocument();
      },
      { timeout: 500 }
    );
  });
});
