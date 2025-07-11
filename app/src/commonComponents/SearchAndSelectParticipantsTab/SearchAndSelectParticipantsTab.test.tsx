// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, render, screen } from '@testing-library/react';

import {
  configureStore,
  mockedLivekitParticipant,
  mockedParticipant,
  renderWithProviders,
} from '../../utils/testUtils';
import SearchAndSelectParticipantsTab from './SearchAndSelectParticipantsTab';
import { SelectableParticipant } from './fragments/SelectParticipantsItem';

describe('Select Participants Tab', () => {
  const mockHandleAllClick = vi.fn();
  const mockHandleSelectedClick = vi.fn();
  const mockHandleSearchChange = vi.fn();
  const mockHandleSelectParticipant = vi.fn();

  it('should call passed functions', () => {
    render(
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

    expect(mockHandleAllClick).toHaveBeenCalled();
    expect(mockHandleSelectedClick).toHaveBeenCalled();
  });
  it('should call handleSearchChange on input', () => {
    render(
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
    expect(mockHandleSearchChange).toHaveBeenCalledExactlyOnceWith('a');
  });

  const participants = [1, 2, 3].map((value) => ({
    ...mockedLivekitParticipant(value),
    participantId: mockedParticipant(value).participantId,
    selected: false,
  })) as SelectableParticipant[];

  it('should render participants', () => {
    const { store } = configureStore();

    const participants = [1, 2, 3].map((value) => ({
      ...mockedLivekitParticipant(value),
      selected: false,
    })) as SelectableParticipant[];
    renderWithProviders(
      <SearchAndSelectParticipantsTab
        handleAllClick={mockHandleAllClick}
        handleSelectedClick={mockHandleSelectedClick}
        handleSearchChange={mockHandleSearchChange}
        handleSelectParticipant={mockHandleSelectParticipant}
        searchValue=""
        participantsList={participants}
      />,
      { store, provider: { mui: true } }
    );

    const participantsList = screen.getAllByRole('listitem');
    expect(participantsList).toHaveLength(participants.length);
  });

  it('should call handleSelectParticipant when a checkbox is clicked', () => {
    const { store } = configureStore({
      initialState: {
        participants: {
          ids: participants.map((p) => p.identity),
          participantIds: participants.map((p) => p.identity),
          entities: Object.fromEntries(
            participants.map((participant) => [participant.identity, { ...participant, displayName: participant.name }])
          ),
        },
      },
    });

    renderWithProviders(
      <SearchAndSelectParticipantsTab
        handleAllClick={mockHandleAllClick}
        handleSelectedClick={mockHandleSelectedClick}
        handleSearchChange={mockHandleSearchChange}
        handleSelectParticipant={mockHandleSelectParticipant}
        searchValue=""
        participantsList={participants}
      />,
      { store, provider: { mui: true } }
    );
    const checkbox1 = screen.getByRole('checkbox', { name: participants[1].name });

    fireEvent.click(checkbox1);
    expect(mockHandleSelectParticipant).toHaveBeenCalledExactlyOnceWith(true, participants[1].identity);
  });
});
