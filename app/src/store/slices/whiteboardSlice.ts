// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { isEmpty } from 'es-toolkit/compat';
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

interface SpacedeckParam {
  url: string | undefined;
}

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
  spacedeck: SpacedeckParam;
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
  spacedeck: {
    url: undefined,
  },
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
    setWhiteboardAvailable(state, { payload }: PayloadAction<SpacedeckParam>) {
      state.isWhiteboardAvailable = !isEmpty(payload.url);
      state.spacedeck.url = payload.url;
    },
  },
  extraReducers: (builder) => {
    // Switching rooms does not re-emit `joinSuccess`, so rebuild both whiteboard providers.
    builder.addCase(switchedRoom, (_, { payload }) => {
      const excalidraw = payload.ownData?.excalidraw;
      const spacedeck = payload.ownData?.whiteboard;
      const excalidrawData = excalidraw && 'elements' in excalidraw.scene ? excalidraw : undefined;
      const hasExcalidraw = Boolean(excalidrawData);
      const hasSpacedeck = spacedeck?.status === 'initialized';

      return {
        ...initialState,
        isWhiteboardAvailable: hasExcalidraw || hasSpacedeck,
        scene: {
          elements: excalidrawData ? castDraft(excalidrawData.scene.elements) : [],
        },
        editRestrictions: {
          enabled: excalidrawData?.editRestrictions.type === 'enabled',
          unrestrictedParticipants:
            excalidrawData && 'unrestrictedParticipants' in excalidrawData.editRestrictions
              ? excalidrawData.editRestrictions.unrestrictedParticipants
              : [],
        },
        spacedeck: {
          url: hasSpacedeck ? spacedeck.url : undefined,
        },
      };
    });
  },
});

export const {
  setStarted,
  setStopped,
  updateRemoteScene,
  addWhiteboardAsset,
  setEditRestrictions,
  setWhiteboardAvailable,
} = whiteboardSlice.actions;

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
