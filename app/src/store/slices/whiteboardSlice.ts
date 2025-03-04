// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../';
import { AssetRef } from '../../api/types/incoming/whiteboard';

export interface ShowWhiteboardParam {
  showWhiteboard: boolean;
  url: string | undefined;
}

interface WhiteboardState {
  isWhiteboardAvailable: boolean;
  whiteboardAssetList: Array<AssetRef>;
  whiteboardUrl?: string;
}

const initialState: WhiteboardState = {
  isWhiteboardAvailable: false,
  whiteboardAssetList: new Array<AssetRef>(),
};

export const whiteboardSlice = createSlice({
  name: 'whiteboard',
  initialState,
  reducers: {
    addWhiteboardAsset(state, { payload }: PayloadAction<{ asset: AssetRef }>) {
      state.whiteboardAssetList.push(payload.asset);
    },
    setWhiteboardAvailable(state, { payload }: PayloadAction<ShowWhiteboardParam>) {
      state.isWhiteboardAvailable = payload.showWhiteboard;
      state.whiteboardUrl = payload.url;
    },
  },
});

export const { setWhiteboardAvailable, addWhiteboardAsset } = whiteboardSlice.actions;

export const actions = whiteboardSlice.actions;

export const selectIsWhiteboardAvailable = (state: RootState) => state.whiteboard.isWhiteboardAvailable;
export const selectWhiteboardUrl = (state: RootState) => state.whiteboard.whiteboardUrl;
export const selectWhiteboardAssets = (state: RootState) => state.whiteboard.whiteboardAssetList;

export default whiteboardSlice.reducer;
