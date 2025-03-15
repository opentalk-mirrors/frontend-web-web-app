// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '..';

export interface SpeedMeterState {
  download: number | undefined;
  upload: number | undefined;
  latency: number | undefined;
}

const meterState: SpeedMeterState = {
  download: undefined,
  upload: undefined,
  latency: undefined,
};

export const speedMeterSlice = createSlice({
  name: 'speed',
  initialState: meterState,
  reducers: {
    initSpeedMeter(state) {
      state.download = undefined;
      state.upload = undefined;
      state.latency = undefined;
    },
    setSpeedDownload(state, { payload: download }: PayloadAction<number | undefined>) {
      state.download = download;
    },
    setSpeedUpload(state, { payload: upload }: PayloadAction<number | undefined>) {
      state.upload = upload;
    },
    setSpeedLatency(state, { payload: latency }: PayloadAction<number | undefined>) {
      state.latency = latency;
    },
  },
});

export const { initSpeedMeter, setSpeedDownload, setSpeedUpload, setSpeedLatency } = speedMeterSlice.actions;

export const selectDownload = (state: RootState) => state.speed.download;
export const selectUpload = (state: RootState) => state.speed.upload;
export const selectLatency = (state: RootState) => state.speed.latency;

export default speedMeterSlice.reducer;
