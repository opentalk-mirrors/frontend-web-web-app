// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Store } from '@reduxjs/toolkit';
import { fireEvent, screen } from '@testing-library/react';

import { ConnectionIdentifier } from '../../types';
import { deconstructConnectionIdentifier } from '../../utils/deconstructConnectionIdentifier';
import { configureStore, mockedLivekitParticipant, renderWithProviders } from '../../utils/testUtils';
import SearchAndSelectParticipantsTab from './SearchAndSelectParticipantsTab';
import { SelectableParticipant } from './fragments/SelectParticipantsItem';

describe('Select Participants Tab', () => {
  const mockHandleAllClick = vi.fn();
  const mockHandleSelectedClick = vi.fn();
  const mockHandleSearchChange = vi.fn();
  const mockHandleSelectParticipant = vi.fn();

  const participants = [1, 2, 3].map((value) => ({
    ...mockedLivekitParticipant(value),
    selected: false,
  })) as SelectableParticipant[];

  const renderSelectParticipantTab = (store: Store, participants?: SelectableParticipant[]) => {
    renderWithProviders(
      <SearchAndSelectParticipantsTab
        handleAllClick={mockHandleAllClick}
        handleSelectedClick={mockHandleSelectedClick}
        handleSearchChange={mockHandleSearchChange}
        handleSelectParticipant={mockHandleSelectParticipant}
        searchValue=""
        participantsList={participants ?? []}
      />,
      { store, provider: { mui: true } }
    );
  };

  it('should enable action buttons by default', () => {
    const { store } = configureStore();
    renderWithProviders(
      <SearchAndSelectParticipantsTab
        handleAllClick={mockHandleAllClick}
        handleSelectedClick={mockHandleSelectedClick}
        handleSearchChange={mockHandleSearchChange}
        handleSelectParticipant={mockHandleSelectParticipant}
        searchValue=""
        participantsList={participants ?? []}
      />,
      { store, provider: { mui: true } }
    );

    const resetAllButton = screen.getByRole('button', { name: /global-all/i });
    expect(resetAllButton).not.toBeDisabled();
    const resetSelectedButton = screen.getByRole('button', { name: /global-selected/i });
    expect(resetSelectedButton).not.toBeDisabled();
  });

  it('should disable action buttons', () => {
    const { store } = configureStore();
    renderWithProviders(
      <SearchAndSelectParticipantsTab
        handleAllClick={mockHandleAllClick}
        handleSelectedClick={mockHandleSelectedClick}
        handleSearchChange={mockHandleSearchChange}
        handleSelectParticipant={mockHandleSelectParticipant}
        searchValue=""
        participantsList={participants ?? []}
        disableActions
      />,
      { store, provider: { mui: true } }
    );

    const resetAllButton = screen.getByRole('button', { name: /global-all/i });
    expect(resetAllButton).toBeDisabled();
    const resetSelectedButton = screen.getByRole('button', { name: /global-selected/i });
    expect(resetSelectedButton).toBeDisabled();
  });

  it('should not show tootlip for "all" action button if actions are not disabled', () => {
    const { store } = configureStore();
    renderWithProviders(
      <SearchAndSelectParticipantsTab
        handleAllClick={mockHandleAllClick}
        handleSelectedClick={mockHandleSelectedClick}
        handleSearchChange={mockHandleSearchChange}
        handleSelectParticipant={mockHandleSelectParticipant}
        searchValue=""
        participantsList={participants ?? []}
        disableActions={false}
        disableActionsTooltip="disabled"
      />,
      { store, provider: { mui: true } }
    );

    const resetAllButton = screen.getByRole('button', { name: /global-all/i });
    fireEvent.mouseOver(resetAllButton);
    const tooltip = screen.queryByText(/disabled/i);
    expect(tooltip).not.toBeInTheDocument();
  });

  it('should show tootlip when hovering over disabled "all" action button', async () => {
    const { store } = configureStore();
    renderWithProviders(
      <SearchAndSelectParticipantsTab
        handleAllClick={mockHandleAllClick}
        handleSelectedClick={mockHandleSelectedClick}
        handleSearchChange={mockHandleSearchChange}
        handleSelectParticipant={mockHandleSelectParticipant}
        searchValue=""
        participantsList={participants ?? []}
        disableActions={true}
        disableActionsTooltip="disabled"
      />,
      { store, provider: { mui: true } }
    );

    const resetAllButton = screen.getByRole('button', { name: /global-all/i });
    fireEvent.mouseOver(resetAllButton);
    const tooltip = await screen.findByText(/disabled/i);
    expect(tooltip).toBeInTheDocument();
  });

  it('should not show tootlip for "selected" action button if actions are not disabled', () => {
    const { store } = configureStore();
    renderWithProviders(
      <SearchAndSelectParticipantsTab
        handleAllClick={mockHandleAllClick}
        handleSelectedClick={mockHandleSelectedClick}
        handleSearchChange={mockHandleSearchChange}
        handleSelectParticipant={mockHandleSelectParticipant}
        searchValue=""
        participantsList={participants ?? []}
        disableActions={false}
        disableActionsTooltip="disabled"
      />,
      { store, provider: { mui: true } }
    );

    const resetAllButton = screen.getByRole('button', { name: /global-selected/i });
    fireEvent.mouseOver(resetAllButton);
    const tooltip = screen.queryByText(/disabled/i);
    expect(tooltip).not.toBeInTheDocument();
  });

  it('should show tootlip when hovering over disabled "selected" action button', async () => {
    const { store } = configureStore();
    renderWithProviders(
      <SearchAndSelectParticipantsTab
        handleAllClick={mockHandleAllClick}
        handleSelectedClick={mockHandleSelectedClick}
        handleSearchChange={mockHandleSearchChange}
        handleSelectParticipant={mockHandleSelectParticipant}
        searchValue=""
        participantsList={participants ?? []}
        disableActions={true}
        disableActionsTooltip="disabled"
      />,
      { store, provider: { mui: true } }
    );

    const resetSelectedButton = screen.getByRole('button', { name: /global-selected/i });
    fireEvent.mouseOver(resetSelectedButton);
    const tooltip = await screen.findByText(/disabled/i);
    expect(tooltip).toBeInTheDocument();
  });

  it('should call passed functions', () => {
    const { store } = configureStore();
    renderSelectParticipantTab(store);
    const allButton = screen.getByRole('button', { name: /global-all/i });
    const selectedButton = screen.getByRole('button', { name: /global-selected/i });

    fireEvent.click(allButton);
    fireEvent.click(selectedButton);

    expect(mockHandleAllClick).toHaveBeenCalled();
    expect(mockHandleSelectedClick).toHaveBeenCalled();
  });

  it('should call handleSearchChange on input', () => {
    const { store } = configureStore();
    renderSelectParticipantTab(store);
    const searchInput = screen.getByRole('textbox');

    fireEvent.change(searchInput, { target: { value: 'a' } });
    expect(mockHandleSearchChange).toHaveBeenCalledExactlyOnceWith('a');
  });

  it('should render participants', () => {
    const { store } = configureStore();
    renderSelectParticipantTab(store, participants);

    const participantsList = screen.getAllByRole('listitem');
    expect(participantsList).toHaveLength(participants.length);
  });

  it('should call handleSelectParticipant when a checkbox is clicked', () => {
    const { store } = configureStore({
      initialState: {
        participants: {
          ids: participants.map((p) => {
            const { participantId } = deconstructConnectionIdentifier(p.identity as ConnectionIdentifier);
            return participantId;
          }),
          entities: Object.fromEntries(
            participants.map((participant) => {
              const { participantId } = deconstructConnectionIdentifier(participant.identity as ConnectionIdentifier);

              return [participantId, { ...participant, displayName: participant.name }];
            })
          ),
        },
      },
    });

    renderSelectParticipantTab(store, participants);
    const checkbox1 = screen.getByRole('checkbox', { name: participants[1].name });

    const { participantId } = deconstructConnectionIdentifier(participants[1].identity as ConnectionIdentifier);
    fireEvent.click(checkbox1);
    expect(mockHandleSelectParticipant).toHaveBeenCalledExactlyOnceWith(true, participantId);
  });
});
