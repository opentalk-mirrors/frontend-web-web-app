// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { createSlice, PayloadAction, WritableDraft } from '@reduxjs/toolkit';

import { getActive, isFullscreenSupported, isBrowser } from '../../../utils/browserUtils';
import { FullscreenState, RequestFullscreenPayload } from './types';

const initialState: FullscreenState = {
  supported: isFullscreenSupported(),
  active: getActive(),
  error: undefined,
  element: undefined,
};

export const fullscreenSlice = createSlice({
  name: 'fullscreen',
  initialState,
  reducers: {
    request(state, _action: PayloadAction<RequestFullscreenPayload | undefined>) {
      state.error = undefined;
    },
    exit(state) {
      state.error = undefined;
    },
    toggle(state, _action: PayloadAction<RequestFullscreenPayload | undefined>) {
      state.error = undefined;
    },
    changed(state, action: PayloadAction<{ active: boolean }>) {
      state.active = action.payload.active;
      if (isBrowser()) {
        state.supported = isFullscreenSupported();
      }
      state.error = undefined;
    },
    failed(state, action: PayloadAction<{ message: string }>) {
      state.error = action.payload.message;
      if (isBrowser()) {
        state.supported = isFullscreenSupported();
      }
    },
    setElement(state, action: PayloadAction<RequestFullscreenPayload | undefined>) {
      state.element = action.payload?.element as WritableDraft<HTMLElement> | undefined;
    },
    refreshSupported(state) {
      if (isBrowser()) {
        state.supported = isFullscreenSupported();
      }
    },
  },
});

export const fullscreenReducer = fullscreenSlice.reducer;
export const fullscreenActions = fullscreenSlice.actions;

export const selectFullscreenElement = (state: { fullscreen: FullscreenState }) => state.fullscreen.element;
export const selectFullscreenSupported = (state: { fullscreen: FullscreenState }) => state.fullscreen.supported;
export const selectFullscreenActive = (state: { fullscreen: FullscreenState }) => state.fullscreen.active;
export const selectFullscreenError = (state: { fullscreen: FullscreenState }) => state.fullscreen.error;
