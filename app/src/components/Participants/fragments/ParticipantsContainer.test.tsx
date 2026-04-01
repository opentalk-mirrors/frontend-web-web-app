// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, fireEvent } from '@testing-library/react';

import { configureStore, mockedParticipant, renderWithProviders } from '../../../utils/testUtils';
import ParticipantsContainer from './ParticipantsContainer';

vi.mock('@livekit/components-react', () => ({
  useRemoteParticipant: () => mockedParticipant(0),
  useLocalParticipant: () => mockedParticipant(0),
}));

describe('ParticipantsContainer', () => {
  const participants = [{ ...mockedParticipant(0) }];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search', () => {
    const { store } = configureStore({
      initialState: {
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
    renderWithProviders(<ParticipantsContainer />, { store, provider: { mui: true } });

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders ungrouped participants if grouping is disabled', () => {
    const { store } = configureStore({
      initialState: {
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
    renderWithProviders(<ParticipantsContainer />, { store, provider: { mui: true } });
    // Ungrouped view: should render ParticipantNoGroups
    expect(screen.queryByRole('heading', { level: 4 })).not.toBeInTheDocument();
  });

  it('dispatches setParticipantsSearchValue when search changes', () => {
    const { store } = configureStore({
      initialState: {
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
    renderWithProviders(<ParticipantsContainer />, { store, provider: { mui: true } });

    const searchInput = screen.getByRole('textbox');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    expect(store.getState().ui.participantsSearchValue).toEqual('test');
  });
});
