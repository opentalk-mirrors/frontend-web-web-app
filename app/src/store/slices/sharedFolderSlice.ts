// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SharedFolderData } from '@opentalk/rest-api-rtk-query';
import { createSlice } from '@reduxjs/toolkit';

import type { RootState } from '..';
import { joinSuccess } from '../commonActions';

interface SharedFolderState {
  opened: boolean;
  sharedFolderData?: SharedFolderData;
  isAvailableIndicatorVisible: boolean;
}

const initialState: SharedFolderState = {
  opened: false,
  isAvailableIndicatorVisible: false,
};

export const sharedFolderSlice = createSlice({
  name: 'shared-folder',
  initialState,
  reducers: {
    sharedFolderOpened: (state) => {
      state.opened = true;
      state.isAvailableIndicatorVisible = false;
    },
    sharedFolderUpdated: (state, { payload }) => {
      state.sharedFolderData = payload;
      if (!state.isAvailableIndicatorVisible && payload && (payload.read || payload.readWrite)) {
        state.isAvailableIndicatorVisible = true;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(joinSuccess, (state, { payload: { sharedFolder } }) => {
      state.sharedFolderData = sharedFolder;
      if (sharedFolder && (sharedFolder.read || sharedFolder.readWrite)) {
        state.isAvailableIndicatorVisible = true;
      }
    });
  },
});

export const { sharedFolderOpened, sharedFolderUpdated } = sharedFolderSlice.actions;

export const actions = sharedFolderSlice.actions;

export const selectIsSharedFolderOpened = (state: RootState) => state.sharedFolder.opened;
export const selectIsSharedFolderAvailable = (state: RootState) => {
  if (state.sharedFolder.sharedFolderData && state.sharedFolder.sharedFolderData.read) {
    return true;
  }
  return false;
};
export const selectSharedFolderUrl = (state: RootState) => {
  if (state.sharedFolder.sharedFolderData && state.sharedFolder.sharedFolderData.readWrite) {
    return state.sharedFolder.sharedFolderData.readWrite.url;
  }
  if (state.sharedFolder.sharedFolderData && state.sharedFolder.sharedFolderData.read) {
    return state.sharedFolder.sharedFolderData.read.url;
  }
};

export const selectSharedFolderPassword = (state: RootState) => {
  if (state.sharedFolder.sharedFolderData && state.sharedFolder.sharedFolderData.readWrite) {
    return state.sharedFolder.sharedFolderData.readWrite.password;
  }
  if (state.sharedFolder.sharedFolderData && state.sharedFolder.sharedFolderData.read) {
    return state.sharedFolder.sharedFolderData.read.password;
  }
};

export const selectIsSharedFolderAvailableIndicatorVisible = (state: RootState) => {
  return state.sharedFolder.isAvailableIndicatorVisible;
};

export default sharedFolderSlice.reducer;
