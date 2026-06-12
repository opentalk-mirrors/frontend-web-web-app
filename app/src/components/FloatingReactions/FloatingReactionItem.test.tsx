// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen } from '@testing-library/react';

import { MeetingNotesAccess, Role } from '../../types';
import { ReactionEmoji } from '../../types/reaction';
import { configureStore, mockedParticipant, renderWithProviders } from '../../utils/testUtils';
import FloatingReactionItem from './FloatingReactionItem';

const participant = mockedParticipant(1);

describe('FloatingReactionItem', () => {
  it('renders the emoji for the given reaction', () => {
    const { store } = configureStore({
      initialState: {
        participants: {
          ids: [participant.id],
          entities: { [participant.id]: participant },
        },
      },
    });

    renderWithProviders(<FloatingReactionItem participantId={participant.id} reaction={ReactionEmoji.Heart} />, {
      store,
      provider: { mui: true },
    });

    const emoji = screen.getByLabelText(ReactionEmoji.Heart);
    expect(emoji).toBeInTheDocument();
    expect(emoji).toHaveTextContent('❤️');
  });

  it("shows the sender's display name for a remote participant", () => {
    const { store } = configureStore({
      initialState: {
        participants: {
          ids: [participant.id],
          entities: { [participant.id]: participant },
        },
        user: {
          uuid: 'current-user',
          displayName: 'Current User',
          role: Role.User,
          meetingNotesAccess: MeetingNotesAccess.None,
          isRoomOwner: false,
        },
      },
    });

    renderWithProviders(<FloatingReactionItem participantId={participant.id} reaction={ReactionEmoji.ThumbsUp} />, {
      store,
      provider: { mui: true },
    });

    expect(screen.getByText(participant.displayName)).toBeInTheDocument();
  });

  it('shows the self label when the reaction belongs to the current user', () => {
    const { store } = configureStore({
      initialState: {
        participants: {
          ids: [participant.id],
          entities: { [participant.id]: participant },
        },
        user: {
          uuid: participant.id,
          displayName: participant.displayName,
          role: Role.User,
          meetingNotesAccess: MeetingNotesAccess.None,
          isRoomOwner: false,
        },
      },
    });

    renderWithProviders(<FloatingReactionItem participantId={participant.id} reaction={ReactionEmoji.ThumbsUp} />, {
      store,
      provider: { mui: true },
    });

    // i18n resources are empty in tests, so the translation key is rendered verbatim.
    expect(screen.getByText('reaction-floating-self-label')).toBeInTheDocument();
    expect(screen.queryByText(participant.displayName)).not.toBeInTheDocument();
  });
});
