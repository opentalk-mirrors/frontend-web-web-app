// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { ListenerEffectAPI } from '@reduxjs/toolkit';

import { ParticipantId, Timestamp } from '../../types';
import { ActiveReaction, ReactionEmoji } from '../../types/reaction';
import type { AppDispatch, RootState } from '../index';
import reducer, {
  FLOATING_REACTION_DURATION,
  floatingReactionExpired,
  handleFloatingReactionExpiredEffect,
  reacted,
  reactionRestrictionsEnabled,
} from './reactionSlice';

const buildReaction = (participantId: string, reaction: ReactionEmoji, timestamp: string): ActiveReaction => ({
  participantId: participantId as ParticipantId,
  reaction,
  timestamp: timestamp as Timestamp,
});

const firstReaction = buildReaction('participant-1', ReactionEmoji.ThumbsUp, '2024-01-01T00:00:00Z');
const secondReaction = buildReaction('participant-2', ReactionEmoji.Heart, '2024-01-01T00:00:01Z');

describe('reactionSlice', () => {
  describe('reducers', () => {
    it('queues the reaction in the floating area and on the participant tile when a participant reacts', () => {
      const state = reducer(undefined, reacted(firstReaction));

      expect(state.floatingReaction).toEqual([firstReaction]);
      expect(state.activeReactions[firstReaction.participantId]).toEqual({
        timestamp: firstReaction.timestamp,
        reaction: firstReaction.reaction,
      });
    });

    it('keeps a separate floating entry for every reaction, including repeats from the same participant', () => {
      const repeat = buildReaction(firstReaction.participantId, firstReaction.reaction, '2024-01-01T00:00:02Z');

      let state = reducer(undefined, reacted(firstReaction));
      state = reducer(state, reacted(repeat));

      expect(state.floatingReaction).toEqual([firstReaction, repeat]);
    });

    it('removes the oldest floating reaction first when one expires', () => {
      let state = reducer(undefined, reacted(firstReaction));
      state = reducer(state, reacted(secondReaction));

      state = reducer(state, floatingReactionExpired());

      expect(state.floatingReaction).toEqual([secondReaction]);
    });

    it('lets already-floating reactions finish when a moderator enables reaction restrictions', () => {
      let state = reducer(undefined, reacted(firstReaction));

      state = reducer(state, reactionRestrictionsEnabled({ unrestrictedParticipants: [] }));

      // The tile reactions are cleared, but the floating reactions are left to expire on their own.
      expect(state.activeReactions).toEqual({});
      expect(state.floatingReaction).toEqual([firstReaction]);
      expect(state.restrictionsState).toEqual({ type: 'enabled', unrestrictedParticipants: [] });
    });
  });

  describe('handleFloatingReactionExpiredEffect', () => {
    it('expires a floating reaction after the configured duration', async () => {
      const dispatch = vi.fn();
      const delay = vi.fn().mockResolvedValue(undefined);
      const listenerApi = { delay, dispatch } as unknown as ListenerEffectAPI<RootState, AppDispatch>;

      await handleFloatingReactionExpiredEffect(reacted(firstReaction), listenerApi);

      expect(delay).toHaveBeenCalledExactlyOnceWith(FLOATING_REACTION_DURATION);
      expect(dispatch).toHaveBeenCalledExactlyOnceWith(floatingReactionExpired());
    });
  });
});
