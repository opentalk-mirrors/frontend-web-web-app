// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import i18next from 'i18next';
import { unionBy } from 'lodash';

import type { RootState } from '../';
import { leaveWhisperGroup } from '../../api/types/outgoing/subroomAudio';
import { notifications } from '../../commonComponents';
import { ParticipantId, WhisperId, WhisperParticipant, WhisperParticipantState } from '../../types';
import { disconnectRoom, hangUp } from '../commonActions';
import type { StartAppListening } from '../listenerMiddleware';

export type SubroomAudioState = {
  token: string | undefined;
  whisperId: WhisperId | undefined;
  participants: WhisperParticipant[];
  isWhisperActive: boolean;
};

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
    setWhisperParticipants: (state, { payload: { participants } }) => {
      state.participants = participants;
    },
    inviteParticipants: (state, { payload: { participants } }) => {
      const newParticipants: WhisperParticipant[] = participants.map((p: ParticipantId) => ({
        participantId: p,
        state: WhisperParticipantState.Invited,
      }));
      state.participants = unionBy(newParticipants, state.participants, 'participantId');
    },
    removeParticipant: (state, { payload: { participantId } }) => {
      state.participants = state.participants.filter((p) => p.participantId !== participantId);
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
  setWhisperParticipants,
  inviteParticipants,
  setIsWhisperActive,
} = subroomAudioSlice.actions;

export const selectSubroomAudioToken = (state: RootState) => state.subroomAudio.token;
export const selectSubroomAudioState = (state: RootState) => state.subroomAudio;
export const selectWhisperGroupId = (state: RootState) => state.subroomAudio.whisperId;
export const selectSubroomAudioParticipants = (state: RootState) => state.subroomAudio.participants;
export const selectIsWhisperActive = (state: RootState) => state.subroomAudio.isWhisperActive;

export default subroomAudioSlice.reducer;

export const startSubroomListeners = (startAppListening: StartAppListening) => {
  startAppListening({
    actionCreator: disconnectRoom.fulfilled,
    effect: async (action, listenerApi) => {
      const { isWhisperRoom } = action.meta.arg;
      if (isWhisperRoom) {
        listenerApi.dispatch(setIsWhisperActive(false));
      }
    },
  });
  startAppListening({
    actionCreator: removeParticipant,
    effect: async (_, listenerApi) => {
      const state = listenerApi.getState().subroomAudio;
      if (state.participants.length < 2) {
        listenerApi.dispatch(resetSubroomAudioData());
        notifications.warning(i18next.t('whisper-group-disbanded'));
      }
    },
  });
};
