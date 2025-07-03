// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { renderWithProviders, mockedParticipant, configureStore } from '../../../utils/testUtils';
import ParticipantGroups from './ParticipantGroups';

describe('ParticipantGroups', () => {
  it('renders group labels and participants', async () => {
    const participants = [
      { ...mockedParticipant(0), groups: ['Group A'] },
      { ...mockedParticipant(1), groups: ['Group B'] },
    ];

    const { store } = configureStore({
      initialState: {
        user: {
          groups: ['Group A', 'Group B'],
        },
        participants: {
          ids: participants.map((p) => p.id),
          entities: Object.fromEntries(participants.map((p) => [p.id, p])),
        },
      },
    });
    renderWithProviders(<ParticipantGroups />, { store });

    const groupAElement = screen.getByRole('heading', { name: 'Group A' });
    const groupBElement = screen.getByRole('heading', { name: 'Group B' });

    expect(groupAElement).toBeInTheDocument();
    expect(groupBElement).toBeInTheDocument();
  });

  it('renders empty state if no participants', () => {
    const { store } = configureStore({
      initialState: {
        participants: {
          ids: [],
          entities: {},
        },
      },
    });

    renderWithProviders(<ParticipantGroups />, { store });

    expect(screen.queryByRole('heading', { name: 'Group A' })).not.toBeInTheDocument();
  });
});
