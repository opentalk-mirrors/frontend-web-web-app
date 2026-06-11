// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { ReactionEmoji } from '../../../types/reaction';
import { configureStore, mockedParticipant, renderWithProviders } from '../../../utils/testUtils';
import ReactionIndicator from './ReactionIndicator';

const participant1 = mockedParticipant(1);
const participant2 = mockedParticipant(2);

describe('ReactionIndicator', () => {
  it('should not render a reaction when the participant has no active reaction', () => {
    const { store } = configureStore({
      initialState: {
        reaction: {
          restrictionsState: { type: 'disabled' },
          activeReactions: {},
        },
      },
    });

    renderWithProviders(<ReactionIndicator participantId={participant1.id} />, { store, provider: { mui: true } });

    expect(screen.queryByLabelText(ReactionEmoji.ThumbsUp)).not.toBeInTheDocument();
  });

  it('should render the correct emoji when the participant has an active reaction', () => {
    const { store } = configureStore({
      initialState: {
        reaction: {
          restrictionsState: { type: 'disabled' },
          activeReactions: {
            [participant1.id]: {
              timestamp: '2024-01-01T00:00:00Z',
              reaction: ReactionEmoji.ThumbsUp,
            },
          },
        },
      },
    });

    renderWithProviders(<ReactionIndicator participantId={participant1.id} />, { store, provider: { mui: true } });

    const indicator = screen.getByLabelText(ReactionEmoji.ThumbsUp);
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveTextContent('👍');
  });

  it('should render heart emoji', () => {
    const { store } = configureStore({
      initialState: {
        reaction: {
          restrictionsState: { type: 'disabled' },
          activeReactions: {
            [participant2.id]: {
              timestamp: '2024-01-01T00:00:00Z',
              reaction: ReactionEmoji.Heart,
            },
          },
        },
      },
    });

    renderWithProviders(<ReactionIndicator participantId={participant2.id} />, { store, provider: { mui: true } });

    const indicator = screen.getByLabelText(ReactionEmoji.Heart);
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveTextContent('❤️');
  });

  it('should have scale(1) when a reaction is present', () => {
    const { store } = configureStore({
      initialState: {
        reaction: {
          restrictionsState: { type: 'disabled' },
          activeReactions: {
            [participant1.id]: {
              timestamp: '2024-01-01T00:00:00Z',
              reaction: ReactionEmoji.Tada,
            },
          },
        },
      },
    });

    renderWithProviders(<ReactionIndicator participantId={participant1.id} />, { store, provider: { mui: true } });

    const indicator = screen.getByLabelText(ReactionEmoji.Tada);
    expect(indicator).toHaveStyle('transform: scale(1);');
  });

  it('should not render indicator for a different participant', () => {
    const { store } = configureStore({
      initialState: {
        reaction: {
          restrictionsState: { type: 'disabled' },
          activeReactions: {
            [participant1.id]: {
              timestamp: '2024-01-01T00:00:00Z',
              reaction: ReactionEmoji.Joy,
            },
          },
        },
      },
    });

    renderWithProviders(<ReactionIndicator participantId={participant2.id} />, { store, provider: { mui: true } });

    expect(screen.queryByLabelText(ReactionEmoji.Joy)).not.toBeInTheDocument();
  });
});
