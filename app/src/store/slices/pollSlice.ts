// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { createEntityAdapter, createSelector, createSlice, EntityState, PayloadAction } from '@reduxjs/toolkit';

import { Started, LiveUpdate, Done } from '../../api/types/incoming/poll';
import { UserChoice } from '../../api/types/outgoing/poll';
import { Choice, ChoiceResult, PollId } from '../../types';
import { joinSuccess } from '../commonActions';

export interface Poll {
  id: PollId;
  topic: string;
  duration: number;
  choices: Array<Choice>;
  results: Array<ChoiceResult>;
  startTime: string;
  stopTime?: string;
  state: 'active' | 'finished';
  live: boolean;
  multipleChoice: boolean;
  voted: boolean;
  selectedChoice?: UserChoice;
}

export interface PollFormValues {
  id?: number;
  topic: string;
  duration: number | string;
  live: boolean;
  multipleChoice: boolean;
  choices: Array<string>;
}

const newPollFromApiType = ({ ...poll }: Started): Poll => ({
  ...poll,
  results: [],
  startTime: new Date().toISOString(),
  state: 'active',
  voted: false,
});

const pollAdapter = createEntityAdapter<Poll>({
  sortComparer: (a, b) => {
    const aDate = Date.parse(a.startTime);
    const bDate = Date.parse(b.startTime);
    return aDate - bDate;
  },
});

export type State = {
  pollIdToShow?: PollId;
  polls: EntityState<Poll, PollId>;
  savedPolls: PollFormValues[];
  showResult: boolean;
};

export const pollSlice = createSlice({
  name: 'poll',
  initialState: {
    polls: pollAdapter.getInitialState(),
    savedPolls: [],
    showResult: false,
  } as State,
  reducers: {
    started: (state, { payload }: PayloadAction<Started>) => {
      state.pollIdToShow = payload.id;
      state.showResult = true;

      const vote: Poll = newPollFromApiType(payload);
      pollAdapter.addOne(state.polls, vote);
    },
    done: (state, { payload }: PayloadAction<Done>) => {
      pollAdapter.updateOne(state.polls, {
        id: payload.id,
        changes: { stopTime: new Date().toISOString(), state: 'finished', results: payload.results },
      });
    },
    liveUpdated: (state, { payload }: PayloadAction<LiveUpdate>) => {
      pollAdapter.updateOne(state.polls, {
        id: payload.id,
        changes: { results: payload.results },
      });
    },
    savePollFormValues: (state, { payload }: PayloadAction<PollFormValues>) => {
      const index = state.savedPolls.findIndex((savedPoll) => savedPoll.id === payload.id);
      if (index !== -1) {
        state.savedPolls[index] = {
          ...state.savedPolls[index],
          ...payload,
        };
        return;
      }
      state.savedPolls.push({
        id: state.savedPolls.length,
        ...payload,
      });
    },
    closedResultWindow: (state) => {
      state.pollIdToShow = undefined;
      state.showResult = false;
    },
    voted: (state, { payload }: PayloadAction<{ pollId: PollId; choice: UserChoice }>) => {
      pollAdapter.updateOne(state.polls, {
        id: payload.pollId,
        changes: { voted: true, selectedChoice: payload.choice },
      });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(joinSuccess, (state, { payload: { polls } }) => {
      if (polls !== undefined) {
        const poll = {
          ...polls,
          results: polls.results || [],
          startTime: polls.started,
          state: 'active',
          voted: false,
        } as Poll;
        state.showResult = true;
        state.pollIdToShow = polls.id;
        pollAdapter.upsertOne(state.polls, poll);
      }
    });
  },
});

export const { started, liveUpdated, done, savePollFormValues, closedResultWindow, voted } = pollSlice.actions;
export const actions = pollSlice.actions;

const selectPolls = (state: { poll: State }) => state.poll.polls;
export const {
  selectIds: selectPollIds,
  selectAll: selectAllPolls,
  selectEntities: selectPollVotes,
  selectById: selectPollById,
} = pollAdapter.getSelectors(selectPolls);

export const selectPollIdToShow = (state: { poll: State }) => state.poll.pollIdToShow;
export const selectPollToShow = createSelector([selectPollIdToShow, selectPollVotes], (pollIdToShow, pollById) =>
  pollIdToShow !== undefined ? pollById[pollIdToShow] : undefined
);
export const selectAllSavedPolls = (state: { poll: State }) => state.poll.savedPolls;
export const selectSavedPollsCount = (state: { poll: State }) => state.poll.savedPolls.length;
export const selectSavedPollPerId = createSelector(
  [selectAllSavedPolls, (_, id: number | undefined) => id],
  (savedPolls, id) => savedPolls.find((savedPoll) => savedPoll.id === id)
);

export const selectShowResult = (state: { poll: State }) => state.poll.showResult;
export default pollSlice.reducer;
