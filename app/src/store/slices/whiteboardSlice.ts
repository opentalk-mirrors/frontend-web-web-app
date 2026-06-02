// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { castDraft } from 'immer';
import { isEmpty } from 'lodash';

import type { RootState } from '../';
import {
  AssetRef,
  WhiteboardEditRestrictions,
  ExcalidrawElements,
  ExcalidrawAppState,
  ExcalidrawScene,
} from '../../api/types/incoming/whiteboard';
import { ParticipantId } from '../../types';

export interface SpacedeckParam {
  url: string | undefined;
}

export interface WhiteboardState {
  isWhiteboardAvailable: boolean;
  whiteboardAssetList: Array<AssetRef>;
  scene: {
    elements: ExcalidrawElements;
    appState?: ExcalidrawAppState;
  };
  collaborators: Record<ParticipantId, { pointer?: { x: number; y: number }; button?: string; displayName?: string }>;
  editRestrictions: {
    enabled: boolean;
    unrestrictedParticipants: ParticipantId[];
  };
  lastUpdateFrom?: ParticipantId;
  spacedeck: SpacedeckParam;
}

const initialState: WhiteboardState = {
  isWhiteboardAvailable: false,
  whiteboardAssetList: [],
  scene: {
    elements: [],
    appState: undefined,
  },
  editRestrictions: {
    enabled: false,
    unrestrictedParticipants: [],
  },
  collaborators: {},
  spacedeck: {
    url: undefined,
  },
};

export const whiteboardSlice = createSlice({
  name: 'whiteboard',
  initialState,
  reducers: {
    setStarted(
      state,
      { payload }: PayloadAction<{ initialElements: ExcalidrawElements; editRestrictions: WhiteboardEditRestrictions }>
    ) {
      state.isWhiteboardAvailable = true;
      state.scene.elements = castDraft(payload.initialElements);
      state.editRestrictions = {
        enabled: payload.editRestrictions?.enabled ?? false,
        unrestrictedParticipants: payload.editRestrictions?.unrestrictedParticipants ?? [],
      };
    },
    updateRemoteScene(state, { payload }: PayloadAction<ExcalidrawScene>) {
      state.scene.elements = castDraft(payload.elements);
      state.scene.appState = castDraft(payload.appState);
      state.isWhiteboardAvailable = true;
    },
    addWhiteboardAsset(state, { payload }: PayloadAction<{ asset: AssetRef }>) {
      state.whiteboardAssetList.push(payload.asset);
    },
    setEditRestrictions(state, { payload }: PayloadAction<{ enabled: boolean; participants?: ParticipantId[] }>) {
      state.editRestrictions.enabled = payload.enabled;
      state.editRestrictions.unrestrictedParticipants = payload.participants ?? [];
    },
    setWhiteboardAvailable(state, { payload }: PayloadAction<SpacedeckParam>) {
      state.isWhiteboardAvailable = !isEmpty(payload.url);
      state.spacedeck.url = payload.url;
    },
  },
});

export const { setStarted, updateRemoteScene, addWhiteboardAsset, setEditRestrictions, setWhiteboardAvailable } =
  whiteboardSlice.actions;

export const actions = whiteboardSlice.actions;

export const selectWhiteboardUrl = (state: RootState) => state.whiteboard.spacedeck.url;
export const selectIsWhiteboardAvailable = (state: RootState) => state.whiteboard.isWhiteboardAvailable;
export const selectWhiteboardElements = (state: RootState) => state.whiteboard.scene.elements;
export const selectWhiteboardAssets = (state: RootState) => state.whiteboard.whiteboardAssetList;
export const selectWhiteboardEditRestrictions = (state: RootState) => state.whiteboard.editRestrictions;
export const selectCanUserEdit = (state: RootState, userId: ParticipantId | null | undefined) => {
  const { enabled, unrestrictedParticipants } = state.whiteboard.editRestrictions;
  if (!enabled) {
    return true;
  }

  if (userId === null || userId === undefined) {
    return false;
  }

  return unrestrictedParticipants.includes(userId);
};

export default whiteboardSlice.reducer;
