// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { Participant } from '../../types';
import { configureStore, mockedParticipant, renderWithProviders } from '../../utils/testUtils';
import Participants from './Participants';

// Mock child components
jest.mock('./fragments/ParticipantsContainer', () => ({
  __esModule: true,
  default: () => <div>ParticipantsContainer</div>,
}));
jest.mock('../TalkingStickParticipantList', () => ({
  TalkingStickParticipantList: ({ participants }: { participants: Array<Participant> }) => (
    <div>TalkingStickParticipantList: {participants?.length ?? 0}</div>
  ),
}));

describe('Participants', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const participants = [
    { ...mockedParticipant(0), groups: ['Group A'] },
    { ...mockedParticipant(1), groups: ['Group B'] },
  ];

  it('renders TalkingStickParticipantList when automod is active', () => {
    const { store } = configureStore({
      initialState: {
        automod: {
          active: true,
          remaining: {
            ids: participants.map((p) => p.id),
            entities: Object.fromEntries(participants.map((p) => [p.id, p.id])),
          },
          history: {
            ids: [],
            entities: {},
          },
        },
        participants: {
          ids: participants.map((p) => p.id),
          entities: Object.fromEntries(participants.map((p) => [p.id, p])),
        },
      },
    });

    renderWithProviders(<Participants />, { store });

    expect(screen.getByText('TalkingStickParticipantList: 2')).toBeInTheDocument();
    expect(screen.queryByText('ParticipantsContainer')).not.toBeInTheDocument();
  });

  it('renders ParticipantsContainer when automod is not active', () => {
    const { store } = configureStore({
      initialState: {
        automod: {
          active: false,
          remaining: {
            ids: participants.map((p) => p.id),
            entities: Object.fromEntries(participants.map((p) => [p.id, p.id])),
          },
          history: {
            ids: [],
            entities: {},
          },
        },
        participants: {
          ids: participants.map((p) => p.id),
          entities: Object.fromEntries(participants.map((p) => [p.id, p])),
        },
      },
    });

    renderWithProviders(<Participants />, { store });
    expect(screen.getByText('ParticipantsContainer')).toBeInTheDocument();
    expect(screen.queryByText(/TalkingStickParticipantList/)).not.toBeInTheDocument();
  });
});
