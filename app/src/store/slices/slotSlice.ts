// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../';
import { ParticipantId } from '../../types';

export interface MachineState {
  showMachine: boolean;
  winnerId: ParticipantId;
  initiatorId: ParticipantId;
  members: ParticipantId[];
}

interface RandomSpeakerData {
  winner: ParticipantId;
  pool: ParticipantId[];
}

const machineState: MachineState = {
  winnerId: '' as ParticipantId,
  initiatorId: '' as ParticipantId,
  showMachine: false,
  members: [],
};

export const slotSlice = createSlice({
  name: 'slot',
  initialState: machineState,
  reducers: {
    initLottery(state, action: PayloadAction<RandomSpeakerData>) {
      const speakerData = action.payload;
      const speakerPool = speakerData.pool;
      // we don't want to interrupt running lotteries at the moment
      if (state.showMachine === false) {
        state.winnerId = speakerData.winner;
        state.members = speakerPool;
        state.showMachine = true;
        state.initiatorId = '' as ParticipantId;
      }
    },

    endLottery: (state) => {
      state.members = [];
      state.winnerId = '' as ParticipantId;
      state.initiatorId = '' as ParticipantId;
      state.showMachine = false;
    },
  },
});

export const { initLottery, endLottery } = slotSlice.actions;
export const lotteryState = (state: RootState) => state.slot;
export const isVisible = (state: RootState) => state.slot.showMachine;

export default slotSlice.reducer;
