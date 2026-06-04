// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '..';
import { ParticipantId } from '../../types';
import { ReactionEmoji, ReactionRestriction } from '../../types/reaction';
import { joinSuccess } from '../commonActions';

export type ReactionState = {
  /* The current state of the reaction restriction */
  restrictionsState: ReactionRestriction;
};

export const reactionSlice = createSlice({
  name: 'reaction',
  initialState: {
    restrictionsState: { type: 'disabled' },
  } as ReactionState,
  reducers: {
    reacted: (_state, _action: PayloadAction<{ participantId: ParticipantId; reaction: ReactionEmoji }>) => {
      // TODO: No state change yet — incoming reactions are not surfaced in the UI.
    },
    reactionRestrictionsEnabled: (state, { payload }: PayloadAction<{ unrestrictedParticipants: ParticipantId[] }>) => {
      state.restrictionsState = {
        type: 'enabled',
        unrestrictedParticipants: payload.unrestrictedParticipants,
      };
    },
    reactionRestrictionsDisabled: (state) => {
      state.restrictionsState = { type: 'disabled' };
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

export const { reacted, reactionRestrictionsEnabled, reactionRestrictionsDisabled } = reactionSlice.actions;

export default reactionSlice.reducer;
