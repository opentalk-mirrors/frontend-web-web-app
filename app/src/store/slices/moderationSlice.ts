// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import type { RootState } from '..';
import { ParticipationLoggingState } from '../../api/types/outgoing/trainingParticipationReport';
import { ForceMute, ForceMuteType } from '../../types';
import { joinSuccess } from '../commonActions';

export type ModerationState = {
  hasHandUp: boolean;
  handUpdatedAt?: string;
  raiseHandsEnabled: boolean;
  forceMute: ForceMute;
  trainingParticipationReportEnabled: boolean;
  selfRenameEnabled: boolean;
};

const initialState: ModerationState = {
  hasHandUp: false,
  raiseHandsEnabled: true,
  forceMute: {
    type: ForceMuteType.Disabled,
    unrestrictedParticipants: [],
  },
  trainingParticipationReportEnabled: false,
  selfRenameEnabled: false,
};

export const moderationSlice = createSlice({
  name: 'moderation',
  initialState,
  reducers: {
    forceLowerHand: (state) => {
      state.hasHandUp = false;
    },
    enableRaisedHands: (state) => {
      state.raiseHandsEnabled = true;
    },
    disableRaisedHands: (state) => {
      state.raiseHandsEnabled = false;
      state.hasHandUp = false;
    },
    forceMuteEnabled: (
      state,
      { payload: { unrestrictedParticipants } }: PayloadAction<Pick<ForceMute, 'unrestrictedParticipants'>>
    ) => {
      state.forceMute = {
        type: ForceMuteType.Enabled,
        unrestrictedParticipants,
      };
    },
    forceMuteDisabled: (state) => {
      state.forceMute = {
        type: ForceMuteType.Disabled,
        unrestrictedParticipants: [],
      };
    },
    trainingParticipationReportEnabled: (state) => {
      state.trainingParticipationReportEnabled = true;
    },
    trainingParticipationReportDisabled: (state) => {
      state.trainingParticipationReportEnabled = false;
    },
    /**
     * Inbound action
     */
    raisedHand: (state, { payload: { timestamp } }: PayloadAction<{ timestamp: string }>) => {
      state.hasHandUp = true;
      state.handUpdatedAt = timestamp;
    },
    /**
     * Inbound action
     */
    loweredHand: (state) => {
      state.hasHandUp = false;
      state.handUpdatedAt = undefined;
    },
    enabledSelfRename: (state) => {
      state.selfRenameEnabled = true;
    },
    disabledSelfRename: (state) => {
      state.selfRenameEnabled = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(joinSuccess, (state, action) => {
      if (action.payload.trainingParticipationReport) {
        state.trainingParticipationReportEnabled =
          action.payload.trainingParticipationReport.state !== ParticipationLoggingState.Disabled;
      }
      const forceMute = action.payload.forceMute;
      if (forceMute) {
        state.forceMute = forceMute;
      } else {
        state.forceMute = {
          type: ForceMuteType.Disabled,
          unrestrictedParticipants: [],
        };
      }
      state.raiseHandsEnabled = action.payload.moderation?.raiseHandsEnabled ?? state.raiseHandsEnabled;
      const displayNameChangeRestrictions = action.payload.moderation?.displayNameChangeRestrictions;
      if (displayNameChangeRestrictions) {
        const restricted =
          displayNameChangeRestrictions.type === 'enabled'
            ? !displayNameChangeRestrictions.unrestrictedParticipants.includes(action.payload.participantId)
            : false;

        state.selfRenameEnabled = !restricted;
      }
    });
  },
});

export const {
  forceLowerHand,
  disableRaisedHands,
  enableRaisedHands,
  raisedHand,
  loweredHand,
  forceMuteEnabled,
  forceMuteDisabled,
  trainingParticipationReportEnabled,
  trainingParticipationReportDisabled,
  disabledSelfRename,
  enabledSelfRename,
} = moderationSlice.actions;
export const actions = moderationSlice.actions;

export const selectHandUp = (state: RootState) => state.moderation.hasHandUp;
export const selectHandUpdatedAt = (state: RootState) => state.moderation.handUpdatedAt;
export const selectRaiseHandsEnabled = (state: RootState) => state.moderation.raiseHandsEnabled;
export const selectForceMute = (state: RootState) => state.moderation.forceMute;
export const selectShouldForceMuted = (state: RootState) =>
  state.user.uuid &&
  state.moderation?.forceMute.type === ForceMuteType.Enabled &&
  !state.moderation.forceMute.unrestrictedParticipants.includes(state.user.uuid);
export const selectMicrophonesEnabled = (state: RootState) =>
  state.moderation.forceMute.type === ForceMuteType.Disabled;
export const selectTrainingParticipationReportEnabled = (state: RootState) =>
  state.moderation.trainingParticipationReportEnabled;
export const selectSelfRenameEnabled = (state: RootState) => state.moderation.selfRenameEnabled;

export default moderationSlice.reducer;
