// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { EntityState, PayloadAction, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';

import type { RootState } from '..';
import { VoteCanceled, VoteStarted, VoteStopped, VoteUpdated, VoteResponse } from '../../api/types/incoming/legalVote';
import log from '../../logger';
import {
  LegalVote,
  LegalVoteId,
  LegalVoteState,
  SavedLegalVoteForm,
  UserVote,
  VoteCancelReason,
  VoteSummary,
  VotesInSlice,
} from '../../types';
import { joinSuccess } from '../commonActions';

const cancelReasonFromApiType = (cancel: VoteCanceled): readonly [VoteCancelReason, string?] | undefined => {
  if (cancel.reason === VoteCancelReason.Custom) {
    return [VoteCancelReason.Custom, cancel.custom];
  } else {
    if (cancel.reason === VoteCancelReason.InitiatorLeft) {
      return [VoteCancelReason.InitiatorLeft, undefined];
    } else if (cancel.reason === VoteCancelReason.RoomDestroyed) {
      return [VoteCancelReason.RoomDestroyed, undefined];
    } else {
      log.error(new Error('Invalid Cancel Reason from legal-vote Cancel'));
      return;
    }
  }
};

interface ActiveVote {
  id: LegalVoteId;
  /**
   * Directly tied to the active vote.
   * It is cleared after vote is submit or the voting itself ends/closes.
   * Used as a fallback after reconnecting during an active vote.
   */
  persistedToken?: string;
  voteInfo?: UserVote;
}

export type State = {
  activeVote?: ActiveVote;
  currentShownVoteId?: LegalVoteId;
  votes: EntityState<LegalVote, LegalVoteId>;
  showResultWindow: boolean;
  savedLegalVotes: Array<SavedLegalVoteForm>;
};

const newLegalVoteFromApiType = ({ legalVoteId, ...other }: VoteStarted): LegalVote => ({
  id: legalVoteId,
  ...other,
  state: LegalVoteState.Started,
  votes: { yes: 0, no: 0, abstain: 0 },
});

const mapVoteCountToVotes = (vote: VoteSummary): VotesInSlice | undefined => {
  switch (vote.state) {
    case LegalVoteState.Finished:
      return {
        yes: vote.yes,
        no: vote.no,
        abstain: (vote.enableAbstain && vote.abstain) || 0,
      };
    case LegalVoteState.Started:
      return {
        yes: 0,
        no: 0,
        abstain: 0,
      };
    default:
      return undefined;
  }
};

const legalVoteAdapter = createEntityAdapter<LegalVote>({
  sortComparer: (a, b) => {
    const aDate = Date.parse(a.startTime);
    const bDate = Date.parse(b.startTime);
    return aDate - bDate;
  },
});

const initialState: State = {
  votes: legalVoteAdapter.getInitialState(),
  savedLegalVotes: [],
  showResultWindow: false,
};
// We currently only allow a single active shown vote.
// It can be changed to Array<VoteId> once we decided to support multiple active votes.

export const legalVoteSlice = createSlice({
  name: 'legalVote',
  initialState: initialState,
  reducers: {
    initialized: (state) => {
      state.votes = legalVoteAdapter.getInitialState();
      state.savedLegalVotes = [];
      state.showResultWindow = false;
    },
    started: (state, { payload }: PayloadAction<VoteStarted>) => {
      state.currentShownVoteId = payload.legalVoteId;
      state.activeVote = {
        id: payload.legalVoteId,
        persistedToken: payload.token,
        voteInfo: undefined,
      };
      state.showResultWindow = true;
      const vote = newLegalVoteFromApiType(payload);
      legalVoteAdapter.addOne(state.votes, vote);
    },
    stopped: (state, { payload }: PayloadAction<VoteStopped>) => {
      state.activeVote = undefined;
      legalVoteAdapter.updateOne(state.votes, {
        id: payload.legalVoteId,
        changes: {
          state: LegalVoteState.Finished,
          votes: {
            yes: payload.results === 'valid' ? payload.yes : 0,
            no: payload.results === 'valid' ? payload.no : 0,
            abstain: payload.results === 'valid' ? payload.abstain || 0 : 0,
          },
          votingRecord: payload.results === 'valid' ? payload.votingRecord : {},
        },
      });
    },
    updated: (state, { payload }: PayloadAction<VoteUpdated>) => {
      // Add 0 default for abstain
      const votes = {
        yes: payload.yes,
        no: payload.no,
        abstain: payload.abstain || 0,
      };

      legalVoteAdapter.updateOne(state.votes, {
        id: payload.legalVoteId,
        changes: { votes, votingRecord: payload.votingRecord || undefined },
      });
    },
    canceled: (state, { payload }: PayloadAction<VoteCanceled>) => {
      const convertedType = cancelReasonFromApiType(payload);
      if (convertedType !== undefined) {
        state.activeVote = undefined;
        const [cancelReason, customCancelReason] = convertedType;
        legalVoteAdapter.updateOne(state.votes, {
          id: payload.legalVoteId,
          changes: {
            state: LegalVoteState.Canceled,
            cancelReason,
            customCancelReason,
          },
        });
      }
    },
    voted: (state, { payload }: PayloadAction<VoteResponse>) => {
      const userVote: UserVote = {
        votedAt: new Date().toISOString(),
        selectedOption: payload.voteOption,
      };

      legalVoteAdapter.updateOne(state.votes, {
        id: payload.legalVoteId,
        changes: {
          userVote,
          //Set token as "permanent" so we can display it for the specific vote
          token: state.activeVote?.persistedToken,
        },
      });

      if (state.activeVote) {
        state.activeVote.voteInfo = userVote;
      }
    },
    closed: (state, { payload }: PayloadAction<LegalVoteId>) => {
      if (state.activeVote !== undefined) {
        // We only allow closing already finished votes for now
        return;
      }
      if (state.currentShownVoteId === payload) {
        state.currentShownVoteId = undefined;
      }
    },
    closedResultWindow: (state) => {
      state.showResultWindow = false;
      state.currentShownVoteId = undefined;
    },
    savedLegalVoteForm: (state, { payload }: PayloadAction<SavedLegalVoteForm>) => {
      const index = state.savedLegalVotes.findIndex((savedLegalVote) => savedLegalVote.id === payload.id);
      if (index !== -1) {
        state.savedLegalVotes[index] = {
          ...state.savedLegalVotes[index],
          ...payload,
        };
        return;
      }
      state.savedLegalVotes.push({
        id: state.savedLegalVotes.length,
        ...payload,
      });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(joinSuccess, (state, { payload: { votes } }) => {
      if (!votes) {
        legalVoteAdapter.removeAll(state.votes);
        return;
      }

      const isAVoteActive = votes.find((vote) => vote.state === LegalVoteState.Started);

      if (!isAVoteActive) {
        state.activeVote = undefined;
      } else {
        state.currentShownVoteId = isAVoteActive.legalVoteId;
      }

      const newList: Array<LegalVote> = votes.map((vote) => ({
        ...vote,
        id: vote.legalVoteId,
        votingRecord: (vote.state === LegalVoteState.Finished && vote.votingRecord) || undefined,
        votes: mapVoteCountToVotes(vote),
        cancelReason: (vote.state === LegalVoteState.Canceled && vote.reason) || undefined,
        customCancelReason:
          (vote.state === LegalVoteState.Canceled && vote.reason === VoteCancelReason.Custom && vote.custom) ||
          undefined,
        userVote: (state.activeVote?.id === vote.legalVoteId && state.activeVote.voteInfo) || undefined,
        token: (state.activeVote?.id === vote.legalVoteId && state.activeVote.persistedToken) || undefined,
      }));

      legalVoteAdapter.setAll(state.votes, newList);
    });
  },
});

export const actions = legalVoteSlice.actions;
export const {
  initialized,
  started,
  stopped,
  updated,
  voted,
  canceled,
  closed,
  closedResultWindow,
  savedLegalVoteForm,
} = actions;

const voteSelectors = legalVoteAdapter.getSelectors<RootState>((state) => state.legalVote.votes);

export const selectVoteById: (id: LegalVoteId) => (state: RootState) => LegalVote | undefined =
  (id: LegalVoteId) => (state: RootState) =>
    voteSelectors.selectById(state, id);
export const selectVoteIds = (state: RootState) => voteSelectors.selectIds(state);
export const selectAllVotes = (state: RootState) => voteSelectors.selectAll(state);
export const selectVotes = (state: RootState) => voteSelectors.selectEntities(state);

export const selectShowLegalVoteWindow = (state: RootState) => state.legalVote.showResultWindow;

export const selectCurrentShownVoteId = (state: RootState) => state.legalVote.currentShownVoteId;
export const selectCurrentShownVote = createSelector(
  [selectCurrentShownVoteId, (state: RootState) => state],
  (currentShownVoteId, state) => {
    return currentShownVoteId ? selectVoteById(currentShownVoteId)(state) : undefined;
  }
);

export const selectActiveVoteId = (state: RootState) => state.legalVote.activeVote?.id;
export const selectPersistedToken = (state: RootState) => state.legalVote.activeVote?.persistedToken;

export const selectAllSavedLegalVotes = (state: RootState) => state.legalVote.savedLegalVotes;
export const selectSavedLegalVotePerId = createSelector(
  [(state: RootState) => state.legalVote.savedLegalVotes, (_state: RootState, id: number | undefined) => id],
  (savedLegalVotes, id) => savedLegalVotes.find((legalVote) => legalVote.id === id)
);
export const selectLegalVoteId = (state: RootState) => state.legalVote.savedLegalVotes.length;

const legalVoteReducer = legalVoteSlice.reducer;
export default legalVoteReducer;
