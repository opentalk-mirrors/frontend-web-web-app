// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { BackendModules } from '@opentalk/rest-api-rtk-query';
import { screen } from '@testing-library/react';

import { ReactionEmoji } from '../../types/reaction';
import { configureStore, mockedParticipant, renderWithProviders } from '../../utils/testUtils';
import FloatingReactionsOverlay from './FloatingReactionsOverlay';

const participant1 = mockedParticipant(1);
const participant2 = mockedParticipant(2);

const buildParticipantsState = () => ({
  ids: [participant1.id, participant2.id],
  entities: {
    [participant1.id]: participant1,
    [participant2.id]: participant2,
  },
});

const floatingReactions = [
  { participantId: participant1.id, reaction: ReactionEmoji.ThumbsUp, timestamp: '2024-01-01T00:00:00Z' },
  { participantId: participant2.id, reaction: ReactionEmoji.Heart, timestamp: '2024-01-01T00:00:01Z' },
];

describe('FloatingReactionsOverlay', () => {
  it('does not render when the reaction module is disabled', () => {
    const { store } = configureStore({
      initialState: {
        config: { enabledModules: {} },
        participants: buildParticipantsState(),
        reaction: {
          restrictionsState: { type: 'disabled' },
          activeReactions: {},
          floatingReaction: floatingReactions,
        },
      },
    });

    renderWithProviders(<FloatingReactionsOverlay />, { store, provider: { mui: true } });

    expect(screen.queryByLabelText(ReactionEmoji.ThumbsUp)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(ReactionEmoji.Heart)).not.toBeInTheDocument();
  });

  it('renders all floating reactions when the module is enabled', () => {
    const { store } = configureStore({
      initialState: {
        config: { enabledModules: { [BackendModules.Reaction]: [] } },
        participants: buildParticipantsState(),
        reaction: {
          restrictionsState: { type: 'disabled' },
          activeReactions: {},
          floatingReaction: floatingReactions,
        },
      },
    });

    renderWithProviders(<FloatingReactionsOverlay />, { store, provider: { mui: true } });

    expect(screen.getByLabelText(ReactionEmoji.ThumbsUp)).toHaveTextContent('👍');
    expect(screen.getByLabelText(ReactionEmoji.Heart)).toHaveTextContent('❤️');
  });

  it('renders an entry for each reaction, including duplicates from the same participant', () => {
    const { store } = configureStore({
      initialState: {
        config: { enabledModules: { [BackendModules.Reaction]: [] } },
        participants: buildParticipantsState(),
        reaction: {
          restrictionsState: { type: 'disabled' },
          activeReactions: {},
          floatingReaction: [
            { participantId: participant1.id, reaction: ReactionEmoji.Clap, timestamp: '2024-01-01T00:00:00Z' },
            { participantId: participant1.id, reaction: ReactionEmoji.Clap, timestamp: '2024-01-01T00:00:01Z' },
          ],
        },
      },
    });

    renderWithProviders(<FloatingReactionsOverlay />, { store, provider: { mui: true } });

    expect(screen.getAllByLabelText(ReactionEmoji.Clap)).toHaveLength(2);
  });

  it('renders nothing when there are no floating reactions', () => {
    const { store } = configureStore({
      initialState: {
        config: { enabledModules: { [BackendModules.Reaction]: [] } },
        participants: buildParticipantsState(),
        reaction: {
          restrictionsState: { type: 'disabled' },
          activeReactions: {},
          floatingReaction: [],
        },
      },
    });

    renderWithProviders(<FloatingReactionsOverlay />, { store, provider: { mui: true } });

    expect(screen.queryByLabelText(ReactionEmoji.ThumbsUp)).not.toBeInTheDocument();
  });
});
