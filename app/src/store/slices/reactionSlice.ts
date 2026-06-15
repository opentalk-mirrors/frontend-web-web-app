// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ListenerEffectAPI } from '@reduxjs/toolkit';

import type { AppDispatch, RootState } from '..';
import { ParticipantId } from '../../types';
import { ActiveReaction, ReactionRestriction } from '../../types/reaction';
import { joinSuccess } from '../commonActions';
import type { StartAppListening } from '../listenerMiddleware';

/* The duration for the emoji on the participants video tile */
const REACTION_TIMEOUT_DURATION = 9000;

/* The duration the emoji is shown in the floating reaction area */
export const FLOATING_REACTION_DURATION = 3000;

export type ReactionState = {
  /* The current state of the reaction restriction */
  restrictionsState: ReactionRestriction;

  /* The lates reaction for each participant, shown on their video tile. */
  activeReactions: {
    [key: ParticipantId]: Omit<ActiveReaction, 'participantId'>;
  };

  /* Current reactions floating in the floating area. This array is sorted by timestamp. */
  floatingReaction: ActiveReaction[];
};

export const reactionSlice = createSlice({
  name: 'reaction',
  initialState: {
    restrictionsState: { type: 'disabled' },
    activeReactions: {},
    floatingReaction: [],
  } as ReactionState,
  reducers: {
    reacted: (state, action: PayloadAction<ActiveReaction>) => {
      state.activeReactions[action.payload.participantId] = {
        timestamp: action.payload.timestamp,
        reaction: action.payload.reaction,
      };

      state.floatingReaction.push(action.payload);
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
    floatingReactionExpired: (state) => {
      state.floatingReaction.shift();
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

export const {
  reacted,
  reactionRestrictionsEnabled,
  reactionRestrictionsDisabled,
  reactionExpired,
  floatingReactionExpired,
} = reactionSlice.actions;

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

export const selectFloatingReactions = (state: RootState): ActiveReaction[] => state.reaction.floatingReaction;

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

export const handleFloatingReactionExpiredEffect = async (
  _action: ReturnType<typeof reacted>,
  listenerApi: ListenerEffectAPI<RootState, AppDispatch>
) => {
  await listenerApi.delay(FLOATING_REACTION_DURATION);

  listenerApi.dispatch(floatingReactionExpired());
};

export const startFloatingReactionListener = (startAppListening: StartAppListening) => {
  startAppListening({
    actionCreator: reacted,
    effect: handleFloatingReactionExpiredEffect,
  });
};

export default reactionSlice.reducer;
