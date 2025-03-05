// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import _ from 'lodash';

import { RootState } from '../';
import { leaveWhisperGroup } from '../../api/types/outgoing/subroomAudio';
import { ParticipantId, WhisperId, WhisperParticipant, WhisperParticipantState } from '../../types';
import { hangUp } from '../commonActions';

interface SubroomAudioState {
  token: string | undefined;
  whisperId: WhisperId | undefined;
  participants: WhisperParticipant[];
  isWhisperActive: boolean;
}

const initialState: SubroomAudioState = {
  token: undefined,
  whisperId: undefined,
  participants: [],
  isWhisperActive: false,
};

export const subroomAudioSlice = createSlice({
  name: 'subroomAudio',
  initialState,
  reducers: {
    setSubroomAudioData: (
      state,
      {
        payload,
      }: PayloadAction<{
        whisperId?: string;
        token?: string;
        participants?: WhisperParticipant[];
      }>
    ) => {
      state.whisperId = payload.whisperId as WhisperId | undefined;
      state.token = payload.token;
      if (payload.participants) {
        state.participants = payload.participants;
      }
    },
    resetSubroomAudioData: () => initialState,
    updateParticipantInviteState: (state, { payload: { participantId, participantState } }) => {
      state.participants = state.participants.map((storedParticipant) =>
        storedParticipant.participantId === participantId
          ? { ...storedParticipant, state: participantState }
          : storedParticipant
      );
    },
    inviteParticipants: (state, { payload: { participants } }) => {
      const newParticipants: WhisperParticipant[] = participants.map((p: ParticipantId) => ({
        participantId: p,
        state: WhisperParticipantState.Invited,
      }));
      state.participants = _.unionBy(newParticipants, state.participants, 'participantId');
    },
    removeParticipant: (state, { payload: { participantId } }) => {
      state.participants = state.participants.filter((p) => p.participantId !== participantId);
      if (state.participants.length < 2) {
        state.participants = [];
        state.token = undefined;
        state.whisperId = undefined;
        state.isWhisperActive = false;
      }
    },
    setIsWhisperActive: (state, { payload }) => {
      state.isWhisperActive = payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(leaveWhisperGroup.action, () => initialState);
    builder.addCase(hangUp.pending, () => initialState);
  },
});

export const {
  setSubroomAudioData,
  resetSubroomAudioData,
  updateParticipantInviteState,
  removeParticipant,
  inviteParticipants,
  setIsWhisperActive,
} = subroomAudioSlice.actions;

export const selectSubroomAudioToken = (state: RootState) => state.subroomAudio.token;
export const selectSubroomAudioState = (state: RootState) => state.subroomAudio;
export const selectWhisperGroupId = (state: RootState) => state.subroomAudio.whisperId;
export const selectSubroomAudioParticipants = (state: RootState) => state.subroomAudio.participants;
export const selectIsWhisperActive = (state: RootState) => state.subroomAudio.isWhisperActive;

export default subroomAudioSlice.reducer;
