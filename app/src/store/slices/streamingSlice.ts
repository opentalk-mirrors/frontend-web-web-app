// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  StreamingKind,
  StreamingStatus,
  StreamingTargetId,
  StreamingTargetEntity,
  StreamingTargetStatusInfo,
} from '@opentalk/rest-api-rtk-query';
import { EntityState, PayloadAction, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';

import type { RootState } from '../';
import { sendStreamConsentSignal } from '../../api/types/outgoing/streaming';
import { hangUp, joinSuccess } from '../commonActions';

interface StreamingTargetFilter {
  status?: StreamingStatus;
  kind?: StreamingKind;
}

const streamingAdapter = createEntityAdapter<StreamingTargetEntity, StreamingTargetId>({
  selectId: (streamTarget) => streamTarget.targetId,
});

export type StreamingState = {
  streams: EntityState<StreamingTargetEntity, StreamingTargetId>;
  consent?: boolean;
};

const initialState: StreamingState = {
  streams: streamingAdapter.getInitialState(),
  consent: undefined,
};

const streamingSlice = createSlice({
  name: 'streaming',
  initialState,
  reducers: {
    streamUpdated: (state, { payload }: PayloadAction<StreamingTargetStatusInfo>) => {
      //Could need to handle potential edge case of going from status.Error to non error -> reason field might not be removed then, but it could also not impact
      streamingAdapter.updateOne(state.streams, { id: payload.targetId, changes: { ...payload } });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(joinSuccess, (state, { payload: { recording: streaming } }) => {
      if (!streaming) {
        streamingAdapter.removeAll(state.streams);
        return;
      }

      const targetList: Array<StreamingTargetEntity> = [];

      for (const key in streaming.targets) {
        const id = key as StreamingTargetId;
        const target = streaming.targets[id];

        targetList.push({
          ...target,
          targetId: id,
        });
      }

      streamingAdapter.setAll(state.streams, targetList);
    });
    builder.addCase(hangUp.pending, () => initialState);
    builder.addCase(sendStreamConsentSignal.action, (state, { payload: { consent } }) => {
      state.consent = consent;
    });
  },
});

export const { streamUpdated } = streamingSlice.actions;

const streamingSelectors = streamingAdapter.getSelectors<RootState>((state) => state.streaming.streams);

const selectAllStreamingTargets = (state: RootState) => streamingSelectors.selectAll(state);

const selectTargetsByStatusAndKind = ({ status, kind }: StreamingTargetFilter) =>
  createSelector([selectAllStreamingTargets], (targets) =>
    targets.filter((target) => (!status || target.status === status) && (!kind || target.streamingKind === kind))
  );

//Could change if we have multiple recording targets
export const selectRecordingTarget: (state: RootState) => StreamingTargetEntity | undefined = createSelector(
  [selectAllStreamingTargets],
  (streamingTargets) =>
    streamingTargets.find((streamingTarget) => streamingTarget.streamingKind === StreamingKind.Recording)
);

export const selectIsRecordingActive = createSelector(
  [selectTargetsByStatusAndKind({ status: StreamingStatus.Active, kind: StreamingKind.Recording })],
  (recordings) => recordings.length > 0
);

const selectActiveStreams = createSelector(
  [selectTargetsByStatusAndKind({ status: StreamingStatus.Active, kind: StreamingKind.Livestream })],
  (streams) => [...streams]
);
export const selectIsStreamActive = createSelector([selectActiveStreams], (activeStreams) => activeStreams.length > 0);

export const selectActiveStreamIds = createSelector([selectActiveStreams], (activeStreams) =>
  activeStreams.map((stream) => stream.targetId)
);

export const selectInactiveStreamIds = createSelector([selectAllStreamingTargets], (targets) =>
  targets
    .filter(
      (target) =>
        target.streamingKind === StreamingKind.Livestream &&
        (target.status === StreamingStatus.Inactive || target.status === StreamingStatus.Error)
    )
    .map((stream) => stream.targetId)
);

const selectHasActiveTarget = createSelector([selectAllStreamingTargets], (streamingTargets) =>
  streamingTargets.some((streamingTarget) => streamingTarget.status === StreamingStatus.Active)
);
const selectHasConsent = (state: RootState) => state.streaming.consent;
export const selectNeedRecordingConsent = createSelector(
  [selectHasActiveTarget, selectHasConsent],
  (hasActiveTarget, hasConsent) => hasActiveTarget && !hasConsent
);

export default streamingSlice.reducer;
