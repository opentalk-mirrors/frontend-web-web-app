// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '..';
import { ParticipantId } from '../../types';
import { ActiveReaction, ReactionRestriction } from '../../types/reaction';
import { joinSuccess } from '../commonActions';
import type { StartAppListening } from '../listenerMiddleware';

const REACTION_TIMEOUT_DURATION = 9000;

export type ReactionState = {
  /* The current state of the reaction restriction */
  restrictionsState: ReactionRestriction;
  activeReactions: {
    [key: ParticipantId]: Omit<ActiveReaction, 'participantId'>;
  };
};

export const reactionSlice = createSlice({
  name: 'reaction',
  initialState: {
    restrictionsState: { type: 'disabled' },
    activeReactions: {},
  } as ReactionState,
  reducers: {
    reacted: (state, action: PayloadAction<ActiveReaction>) => {
      state.activeReactions[action.payload.participantId] = {
        timestamp: action.payload.timestamp,
        reaction: action.payload.reaction,
      };
    },
    reactionRestrictionsEnabled: (state, { payload }: PayloadAction<{ unrestrictedParticipants: ParticipantId[] }>) => {
      state.restrictionsState = {
        type: 'enabled',
        unrestrictedParticipants: payload.unrestrictedParticipants,
      };
      state.activeReactions = {};
    },
    reactionRestrictionsDisabled: (state) => {
      state.restrictionsState = { type: 'disabled' };
    },
    reactionExpired: (state, action: PayloadAction<ParticipantId>) => {
      delete state.activeReactions[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(joinSuccess, (state, { payload: { reaction } }) => {
      state.restrictionsState = reaction?.restrictions || {
        type: 'disabled',
      };
    });
  },
});

/*
 * Is the current user affected by a reaction restriction state.
 */
export const selectReactionAllowed = (state: RootState): boolean => {
  const { restrictionsState } = state.reaction;
  if (restrictionsState.type === 'disabled') {
    return true;
  }
  return state.user.uuid !== null && restrictionsState.unrestrictedParticipants.includes(state.user.uuid);
};

/*
 * Is a reaction restriction state active. This does not signal whether the user is allowed to send reactions.
 */
export const selectReactionRestrictionsEnabled = (state: RootState): boolean =>
  state.reaction.restrictionsState.type === 'enabled';

export const selectParticipantReaction = (
  state: RootState,
  participantId: ParticipantId
): Omit<ActiveReaction, 'participantId'> | null => state.reaction.activeReactions[participantId] ?? null;

export const selectHasOwnReaction = (state: RootState): boolean =>
  state.user.uuid ? state.user.uuid in state.reaction.activeReactions : false;

export const { reacted, reactionRestrictionsEnabled, reactionRestrictionsDisabled, reactionExpired } =
  reactionSlice.actions;

export const startReactionClearTimeoutListener = (startAppListening: StartAppListening) => {
  startAppListening({
    actionCreator: reacted,
    effect: async (action, listenerApi) => {
      const { participantId } = action.payload;

      // Abort if same participant reacts again before timeout
      const wasInterrupted = await listenerApi.condition((nextAction) => {
        return reacted.match(nextAction) && nextAction.payload.participantId === participantId;
      }, REACTION_TIMEOUT_DURATION);

      if (!wasInterrupted) {
        listenerApi.dispatch(reactionExpired(participantId));
      }
    },
  });
};

export default reactionSlice.reducer;
