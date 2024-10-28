// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Provider } from 'react-redux';

import store from '../../store';
import { fireEvent, mockedLivekitParticipant, render, screen, waitFor } from '../../utils/testUtils';
import SearchAndSelectParticipantsTab from './SearchAndSelectParticipantsTab';
import { SelectableParticipant } from './fragments/SelectParticipantsItem';

describe('Select Participants Tab', () => {
  const mockHandleAllClick = jest.fn();
  const mockHandleSelectedClick = jest.fn();
  const mockHandleSearchChange = jest.fn();
  const mockHandleSelectParticipant = jest.fn();

  it('should call passed functions', async () => {
    await render(
      <SearchAndSelectParticipantsTab
        handleAllClick={mockHandleAllClick}
        handleSelectedClick={mockHandleSelectedClick}
        handleSearchChange={mockHandleSearchChange}
        handleSelectParticipant={mockHandleSelectParticipant}
        searchValue=""
        participantsList={[]}
      />
    );

    const allButton = screen.getByRole('button', { name: /global-all/i });
    const selectedButton = screen.getByRole('button', { name: /global-selected/i });

    fireEvent.click(allButton);
    fireEvent.click(selectedButton);

    await waitFor(() => {
      expect(mockHandleAllClick).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockHandleSelectedClick).toHaveBeenCalled();
    });
  });
  it('should call handleSearchChange on input', async () => {
    await render(
      <SearchAndSelectParticipantsTab
        handleAllClick={mockHandleAllClick}
        handleSelectedClick={mockHandleSelectedClick}
        handleSearchChange={mockHandleSearchChange}
        handleSelectParticipant={mockHandleSelectParticipant}
        searchValue=""
        participantsList={[]}
      />
    );

    const searchInput = screen.getByRole('textbox');

    fireEvent.change(searchInput, { target: { value: 'a' } });

    await waitFor(() => {
      expect(mockHandleSearchChange).toHaveBeenCalledWith('a');
    });
  });
  it('should render participants', async () => {
    const participants = [1, 2, 3].map((value) => ({
      ...mockedLivekitParticipant(value),
      selected: false,
    })) as SelectableParticipant[];
    await render(
      <Provider store={store}>
        <SearchAndSelectParticipantsTab
          handleAllClick={mockHandleAllClick}
          handleSelectedClick={mockHandleSelectedClick}
          handleSearchChange={mockHandleSearchChange}
          handleSelectParticipant={mockHandleSelectParticipant}
          searchValue=""
          participantsList={participants}
        />
      </Provider>
    );

    const participantsList = screen.getAllByRole('listitem');
    expect(participantsList).toHaveLength(participants.length);
  });

  // TODO: livekit - fix
  // it('should call handleSelectParticipant when a checkbox is clicked', async () => {
  //   const participants = [1, 2, 3].map((value) => ({ ...mockedLivekitParticipant(value), selected: false })) as SelectableParticipant[];
  //   await render(
  //     <Provider store={store}>
  //       <SearchAndSelectParticipantsTab
  //         handleAllClick={mockHandleAllClick}
  //         handleSelectedClick={mockHandleSelectedClick}
  //         handleSearchChange={mockHandleSearchChange}
  //         handleSelectParticipant={mockHandleSelectParticipant}
  //         searchValue=""
  //         participantsList={participants}
  //       />
  //     </Provider>
  //   );
  //   const checkbox1 = screen.getByRole('checkbox', { name: participants[1].name });

  //   fireEvent.click(checkbox1);

  //   await waitFor(() => {
  //     expect(mockHandleSelectParticipant).toHaveBeenCalledWith(true, participants[1].identity);
  //   });
  // });
});
