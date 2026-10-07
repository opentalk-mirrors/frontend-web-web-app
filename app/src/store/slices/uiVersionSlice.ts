// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
// V2-CLEANUP: entire file is part of the v1/v2 transition - delete when v2 is the default
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import type { RootState } from '../';
import { localStorageItems } from '../../config/storage';
import { ConferenceUiVersion, isConferenceUiVersion } from '../../config/uiVersion';
import type { StartAppListening } from '../listenerMiddleware';

export type UiVersionState = {
  preferredVersion: ConferenceUiVersion;
};

export const initialState: UiVersionState = {
  preferredVersion: ConferenceUiVersion.V1,
};

export const loadUiVersionFromLocalStorage = (): Partial<UiVersionState> | undefined => {
  const stored = localStorage.getItem(localStorageItems.conferenceUiVersion);
  if (stored === null || !isConferenceUiVersion(stored)) {
    return undefined;
  }
  return { preferredVersion: stored };
};

export const saveUiVersionToLocalStorage = (version: ConferenceUiVersion) => {
  localStorage.setItem(localStorageItems.conferenceUiVersion, version);
};

const uiVersionSlice = createSlice({
  name: 'uiVersion',
  initialState,
  reducers: {
    setPreferredConferenceUiVersion: (state, { payload }: PayloadAction<ConferenceUiVersion>) => {
      state.preferredVersion = payload;
    },
  },
});

export const { setPreferredConferenceUiVersion } = uiVersionSlice.actions;

export const selectPreferredConferenceUiVersion = (state: RootState) => state.uiVersion.preferredVersion;

export const startUiVersionListeners = (startAppListening: StartAppListening) => {
  startAppListening({
    actionCreator: setPreferredConferenceUiVersion,
    effect: ({ payload }) => saveUiVersionToLocalStorage(payload),
  });
};

export default uiVersionSlice.reducer;
