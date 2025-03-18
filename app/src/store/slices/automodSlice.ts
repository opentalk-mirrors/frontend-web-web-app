// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { EntityState, PayloadAction, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';

import type { RootState } from '..';
import {
  AutomodRemainingUpdatedEvent,
  AutomodSpeakerUpdatedEvent,
  AutomodStartedEvent,
} from '../../api/types/incoming/automod';
import { AutomodSelectionStrategy, ParticipantId } from '../../types';
import { MilliSeconds } from '../../utils/tsUtils';
import { joinSuccess } from '../commonActions';

export enum SpeakerState {
  Active = 'active',
  Inactive = 'inactive',
  Transitioning = 'transitioning',
}

const remainingParticipantsAdapter = createEntityAdapter<ParticipantId, ParticipantId>({
  selectId: (participant) => participant,
});

const historyParticipantsAdapter = createEntityAdapter<ParticipantId, ParticipantId>({
  selectId: (participant) => participant,
});

export interface AutomodState {
  active: boolean;
  selectionStrategy: AutomodSelectionStrategy;
  history: EntityState<ParticipantId, ParticipantId>;
  remaining: EntityState<ParticipantId, ParticipantId>;
  animationOnRandom: boolean;
  allowDoubleSelection: boolean;
  timeLimit: MilliSeconds | null;
  showList: boolean;
  considerHandRaise: boolean;
  speakerId?: ParticipantId;
  issuedBy?: ParticipantId;
  speakerState: SpeakerState;
  participantId?: ParticipantId;
}

function getInitialState() {
  const initialState: AutomodState = {
    active: false,
    selectionStrategy: AutomodSelectionStrategy.Playlist,
    history: historyParticipantsAdapter.getInitialState(),
    remaining: remainingParticipantsAdapter.getInitialState(),
    animationOnRandom: false,
    allowDoubleSelection: false,
    timeLimit: null,
    showList: false,
    considerHandRaise: false,
    speakerId: undefined,
    issuedBy: undefined,
    speakerState: SpeakerState.Inactive,
  };
  return initialState;
}

function reset(state: AutomodState) {
  const initialState = getInitialState();
  state.active = initialState.active;
  state.history = historyParticipantsAdapter.getInitialState();
  state.remaining = remainingParticipantsAdapter.getInitialState();
  state.selectionStrategy = initialState.selectionStrategy;
  state.animationOnRandom = initialState.animationOnRandom;
  state.allowDoubleSelection = initialState.allowDoubleSelection;
  state.timeLimit = initialState.timeLimit;
  state.showList = initialState.showList;
  state.considerHandRaise = initialState.considerHandRaise;
  state.speakerId = undefined;
  state.issuedBy = undefined;
  state.speakerState = SpeakerState.Inactive;
}

export const automodSlice = createSlice({
  name: 'automod',
  initialState: getInitialState(),
  reducers: {
    started: (state, { payload }: PayloadAction<AutomodStartedEvent>) => {
      state.active = true;
      historyParticipantsAdapter.setAll(state.history, payload.history);
      remainingParticipantsAdapter.setAll(state.remaining, payload.remaining);
      state.selectionStrategy = payload.selectionStrategy;
      state.animationOnRandom = payload.animationOnRandom;
      state.allowDoubleSelection = payload.allowDoubleSelection;
      state.timeLimit = payload.timeLimit || null;
      state.showList = payload.showList;
      state.considerHandRaise = payload.considerHandRaise;
      state.issuedBy = payload.issuedBy;
    },
    stopped: reset,
    speakerUpdated: (state, action: PayloadAction<AutomodSpeakerUpdatedEvent>) => {
      state.speakerId = action.payload.speaker || undefined;
      remainingParticipantsAdapter.setAll(state.remaining, action.payload.remaining || []);
      historyParticipantsAdapter.setAll(state.history, action.payload.history || []);
      // state.animationRunning = false;
    },
    remainingUpdated: (state, action: PayloadAction<AutomodRemainingUpdatedEvent>) => {
      remainingParticipantsAdapter.setAll(state.remaining, action.payload.remaining);
    },
    setAsActiveSpeaker: (state) => {
      state.speakerState = SpeakerState.Active;
    },
    setAsInactiveSpeaker: (state) => {
      state.speakerState = SpeakerState.Inactive;
    },
    setAsTransitioningSpeaker: (state) => {
      state.speakerState = SpeakerState.Transitioning;
    },
    // animationStarted: (state, action: PayloadAction<AutomodStartAnimation>) => {
    //   state.animationRunning = true;
    //   state.animationInformation = action.payload;
    // },
  },
  extraReducers: (builder) => {
    builder.addCase(joinSuccess, (state, { payload: { automod, participantId } }) => {
      state.participantId = participantId;
      if (automod) {
        state.active = true;
        state.history = historyParticipantsAdapter.setAll(state.history, automod.config.history);
        state.remaining = remainingParticipantsAdapter.setAll(state.remaining, automod.config.remaining);
        state.selectionStrategy = automod.config.selectionStrategy;
        state.animationOnRandom = automod.config.animationOnRandom;
        state.allowDoubleSelection = automod.config.allowDoubleSelection;
        state.timeLimit = automod.config.timeLimit || null;
        state.showList = automod.config.showList;
        state.considerHandRaise = automod.config.considerHandRaise;
        state.speakerId = automod.speaker || undefined;
      } else {
        reset(state);
      }
    });
  },
});

export const {
  started,
  stopped,
  speakerUpdated,
  remainingUpdated,
  setAsActiveSpeaker,
  setAsInactiveSpeaker,
  setAsTransitioningSpeaker,
} = automodSlice.actions;

export const actions = automodSlice.actions;

export const selectAutomodActiveState = (state: RootState) => state.automod.active;

const historySelectors = historyParticipantsAdapter.getSelectors();
const remainingSelectors = remainingParticipantsAdapter.getSelectors();

const selectAllHistory = (state: RootState) => historySelectors.selectAll(state.automod.history);
const selectAllRemaining = (state: RootState) => remainingSelectors.selectAll(state.automod.remaining);

export const selectAutomoderationParticipantIds = createSelector(
  [selectAllHistory, selectAllRemaining],
  (history, remaining) => {
    return history.concat(remaining);
  }
);

export const selectSpeakerId = (state: RootState) => state.automod.speakerId;

export const selectSpeakerState = (state: RootState) => state.automod.speakerState;

export const selectMyParticipantId = (state: RootState) => state.automod.participantId;

export const automodReducer = automodSlice.reducer;

export default automodReducer;
