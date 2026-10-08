// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { castDraft } from 'immer';

import type { RootState } from '../';
import {
  AssetRef,
  WhiteboardEditRestrictions,
  ExcalidrawElements,
  ExcalidrawScene,
} from '../../api/types/incoming/whiteboard';
import { ParticipantId } from '../../types';
import { switchedRoom } from './breakoutSlice';

interface WhiteboardState {
  isWhiteboardAvailable: boolean;
  whiteboardAssetList: Array<AssetRef>;
  scene: {
    elements: ExcalidrawElements;
  };
  collaborators: Record<ParticipantId, { pointer?: { x: number; y: number }; button?: string; displayName?: string }>;
  editRestrictions: {
    enabled: boolean;
    unrestrictedParticipants: ParticipantId[];
  };
  lastUpdateFrom?: ParticipantId;
}

const initialState: WhiteboardState = {
  isWhiteboardAvailable: false,
  whiteboardAssetList: [],
  scene: {
    elements: [],
  },
  editRestrictions: {
    enabled: false,
    unrestrictedParticipants: [],
  },
  collaborators: {},
};

const whiteboardSlice = createSlice({
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
    setStopped(state) {
      state.isWhiteboardAvailable = false;
      state.scene.elements = [];
      state.editRestrictions = {
        enabled: false,
        unrestrictedParticipants: [],
      };
      state.collaborators = {};
    },
    updateRemoteScene(state, { payload }: PayloadAction<ExcalidrawScene>) {
      state.scene.elements = castDraft(payload.elements);
      state.isWhiteboardAvailable = true;
    },
    addWhiteboardAsset(state, { payload }: PayloadAction<{ asset: AssetRef }>) {
      state.whiteboardAssetList.push(payload.asset);
    },
    setEditRestrictions(state, { payload }: PayloadAction<{ enabled: boolean; participants?: ParticipantId[] }>) {
      state.editRestrictions.enabled = payload.enabled;
      state.editRestrictions.unrestrictedParticipants = payload.participants ?? [];
    },
  },
  extraReducers: (builder) => {
    // Switching rooms does not re-emit `joinSuccess`, so rebuild the whiteboard state.
    builder.addCase(switchedRoom, (_, { payload }) => {
      const whiteboard = payload.ownData?.whiteboard;
      const whiteboardData = whiteboard && 'elements' in whiteboard.scene ? whiteboard : undefined;

      return {
        ...initialState,
        isWhiteboardAvailable: Boolean(whiteboardData),
        scene: {
          elements: whiteboardData ? castDraft(whiteboardData.scene.elements) : [],
        },
        editRestrictions: {
          enabled: whiteboardData?.editRestrictions.type === 'enabled',
          unrestrictedParticipants:
            whiteboardData && 'unrestrictedParticipants' in whiteboardData.editRestrictions
              ? whiteboardData.editRestrictions.unrestrictedParticipants
              : [],
        },
      };
    });
  },
});

export const { setStarted, setStopped, updateRemoteScene, addWhiteboardAsset, setEditRestrictions } =
  whiteboardSlice.actions;

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
