// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  StreamStatus,
  StreamingStatus,
  StreamingTargetId,
  StreamingTargetEntity,
  StreamingTargetStatusInfo,
} from '@opentalk/rest-api-rtk-query';
import {
  EntityState,
  ListenerEffectAPI,
  PayloadAction,
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';

import type { AppDispatch, RootState } from '../';
import { sendStartRecordingSignal, sendStreamConsentSignal } from '../../api/types/outgoing/streaming';
import { hangUp, joinSuccess } from '../commonActions';
import type { StartAppListening } from '../listenerMiddleware';

interface StreamingTargetFilter {
  status?: StreamStatus;
}

const streamingAdapter = createEntityAdapter<StreamingTargetEntity, StreamingTargetId>({
  selectId: (streamTarget) => streamTarget.targetId,
});

type StreamingState = {
  streams: EntityState<StreamingTargetEntity, StreamingTargetId>;
  recording: StreamingStatus;
  isStartRecordingRequested: boolean;
  consent?: boolean;
};

const initialState: StreamingState = {
  streams: streamingAdapter.getInitialState(),
  recording: StreamingStatus.Inactive,
  isStartRecordingRequested: false,
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
    recordingStatusUpdated: (state, { payload }: PayloadAction<StreamingStatus>) => {
      state.recording = payload;
      state.isStartRecordingRequested = false;
    },
    startRecordingRequestTimedOut: (state) => {
      state.isStartRecordingRequested = false;
    },
    startRecordingFailed: (state) => {
      state.isStartRecordingRequested = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(joinSuccess, (state, { payload: { recording: streaming } }) => {
      state.isStartRecordingRequested = false;
      if (!streaming) {
        streamingAdapter.removeAll(state.streams);
        return;
      }

      const targetList: Array<StreamingTargetEntity> = [];

      for (const key in streaming.streamStates) {
        const id = key as StreamingTargetId;
        const target = streaming.streamStates[id];

        targetList.push({
          ...target,
          targetId: id,
        });
      }

      streamingAdapter.setAll(state.streams, targetList);
      state.recording = streaming.recordingState.status;
    });
    builder.addCase(hangUp.pending, () => initialState);
    builder.addCase(sendStreamConsentSignal.action, (state, { payload: { consent } }) => {
      state.consent = consent;
    });
    builder.addCase(sendStartRecordingSignal.action, (state) => {
      state.isStartRecordingRequested = true;
    });
  },
});

export const { streamUpdated, recordingStatusUpdated, startRecordingRequestTimedOut, startRecordingFailed } =
  streamingSlice.actions;

const streamingSelectors = streamingAdapter.getSelectors<RootState>((state) => state.streaming.streams);

const selectAllStreamingTargets = (state: RootState) => streamingSelectors.selectAll(state);
export const selectRecordingTargetStatus = (state: RootState) => state.streaming.recording;
export const selectIsStartRecordingRequested = (state: RootState) => state.streaming.isStartRecordingRequested;

const selectTargetsByStatus = ({ status }: StreamingTargetFilter) =>
  createSelector([selectAllStreamingTargets], (targets) =>
    targets.filter((target) => !status || target.status === status)
  );

export const selectIsRecordingActive = createSelector(
  [selectRecordingTargetStatus],
  (recordingStatus) => recordingStatus === StreamingStatus.Active
);

const selectActiveStreams = createSelector([selectTargetsByStatus({ status: StreamStatus.Active })], (streams) => [
  ...streams,
]);
export const selectIsStreamActive = createSelector([selectActiveStreams], (activeStreams) => activeStreams.length > 0);

export const selectActiveStreamIds = createSelector([selectActiveStreams], (activeStreams) =>
  activeStreams.map((stream) => stream.targetId)
);

export const selectInactiveStreamIds = createSelector([selectAllStreamingTargets], (targets) =>
  targets
    .filter((target) => target.status === StreamStatus.Inactive || target.status === StreamStatus.Error)
    .map((stream) => stream.targetId)
);

const selectHasActiveStreamingTarget = createSelector([selectAllStreamingTargets], (streamingTargets) =>
  streamingTargets.some((streamingTarget) => streamingTarget.status === StreamStatus.Active)
);

const selectHasStreamingConsent = (state: RootState) => state.streaming.consent;

export const selectNeedRecordingConsent = createSelector(
  [selectHasActiveStreamingTarget, selectRecordingTargetStatus, selectHasStreamingConsent],
  (hasActiveTarget, recordingTargetStatus, hasConsent) => {
    if (!hasActiveTarget && recordingTargetStatus !== StreamingStatus.Active) {
      return false;
    }
    if (!hasConsent) {
      return true;
    }
    return false;
  }
);

export default streamingSlice.reducer;

const START_RECORDING_REQUEST_TIMEOUT_MS = 10_000;

// Fallback in case the backend never answers the start recording request with a status update.
const startRecordingRequestTimeoutListener = (startAppListening: StartAppListening) =>
  startAppListening({
    actionCreator: sendStartRecordingSignal.action,
    effect: async (_, listenerApi: ListenerEffectAPI<RootState, AppDispatch>) => {
      listenerApi.cancelActiveListeners();
      await listenerApi.delay(START_RECORDING_REQUEST_TIMEOUT_MS);
      if (listenerApi.getState().streaming.isStartRecordingRequested) {
        listenerApi.dispatch(startRecordingRequestTimedOut());
      }
    },
  });

export const startStreamingListeners = (startAppListening: StartAppListening) => {
  startRecordingRequestTimeoutListener(startAppListening);
};
