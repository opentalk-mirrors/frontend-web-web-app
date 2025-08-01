// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, fireEvent } from '@testing-library/react';

import { configureStore, mockedParticipant, renderWithProviders } from '../../../utils/testUtils';
import ParticipantsContainer from './ParticipantsContainer';

describe('ParticipantsContainer', () => {
  const participants = [{ ...mockedParticipant(0), groups: ['Group A'] }];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search, grouping form, and grouped participants if grouping is enabled', () => {
    const { store } = configureStore({
      initialState: {
        user: {
          groups: ['Group A'],
        },
        ui: {
          showParticipantGroups: true,
          participantsSearchValue: '',
        },
        participants: {
          ids: participants.map((p) => p.id),
          entities: Object.fromEntries(participants.map((p) => [p.id, p])),
        },
      },
    });
    renderWithProviders(<ParticipantsContainer />, { store });

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    // Grouped view: should render ParticipantGroups
    expect(screen.getByRole('heading', { level: 4 })).toBeInTheDocument();
  });

  it('renders ungrouped participants if grouping is disabled', () => {
    const { store } = configureStore({
      initialState: {
        user: {
          groups: ['Group A'],
        },
        ui: {
          showParticipantGroups: false,
          participantsSearchValue: '',
        },
        participants: {
          ids: participants.map((p) => p.id),
          entities: Object.fromEntries(participants.map((p) => [p.id, p])),
        },
      },
    });
    renderWithProviders(<ParticipantsContainer />, { store });
    // Ungrouped view: should render ParticipantNoGroups
    expect(screen.queryByRole('heading', { level: 4 })).not.toBeInTheDocument();
  });

  it('dispatches setParticipantsSearchValue when search changes', () => {
    const { store } = configureStore({
      initialState: {
        user: {
          groups: ['Group A'],
        },
        ui: {
          showParticipantGroups: false,
          participantsSearchValue: '',
        },
        participants: {
          ids: participants.map((p) => p.id),
          entities: Object.fromEntries(participants.map((p) => [p.id, p])),
        },
      },
    });
    renderWithProviders(<ParticipantsContainer />, { store });

    const searchInput = screen.getByRole('textbox');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    expect(store.getState().ui.participantsSearchValue).toEqual('test');
  });
});
