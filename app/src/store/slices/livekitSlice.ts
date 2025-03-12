// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
// Redux has limitations with non-serializable data, like the LiveKit room object, as it can cause issues with state persistence.
// We've decided to use a separate slice and declare an exception in the store for now.
import {
  ListenerEffectAPI,
  PayloadAction,
  createListenerMiddleware,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';

import type { AppDispatch, RootState } from '../';
import { Credentials } from '../../api/types/incoming/livekit';
import { createNewAccessToken } from '../../api/types/outgoing/livekit';
import { MediaDescriptor } from '../../modules/WebRTC';
import { VideoSetting } from '../../types';
import { hangUp, joinSuccess } from '../commonActions';
import { setLivekitUnavailable } from '../livekitRoom';
import { getLivekitRoom } from '../livekitRoom';

type PopoutStreamAccess = {
  mediaDescriptor: MediaDescriptor;
  token: string | undefined;
};

type PopoutStreamAccesses = Array<PopoutStreamAccess>;

interface LivekitState {
  unavailable: boolean;
  accessToken: string | undefined;
  publicUrl: string | undefined;
  popoutStreamAccesses: PopoutStreamAccesses;
  qualityCap: VideoSetting;
}

const initialState: LivekitState = {
  unavailable: false,
  accessToken: undefined,
  publicUrl: undefined,
  popoutStreamAccesses: [],
  qualityCap: VideoSetting.High,
};

export const livekitSlice = createSlice({
  name: 'livekit',
  initialState,
  reducers: {
    addPopoutStreamAccess: (state, { payload }: PayloadAction<MediaDescriptor>) => {
      state.popoutStreamAccesses.push({
        mediaDescriptor: payload,
        token: undefined,
      });
    },
    setNewAccessToken: (state, { payload }: PayloadAction<Credentials>) => {
      state.accessToken = payload.token;
      state.publicUrl = payload.publicUrl;
    },
    setLivekitPopoutStreamAccessToken: (state, { payload }: PayloadAction<string>) => {
      const popoutStreamAccess = state.popoutStreamAccesses.find(
        (popoutStreamAccess) => popoutStreamAccess.token === undefined
      );
      if (popoutStreamAccess) {
        popoutStreamAccess.token = payload;
      } else {
        console.warn('cant find popoutStreamAccess to add token');
      }
    },
    deleteLivekitPopoutStreamAccessToken: (state, { payload }: PayloadAction<string>) => {
      state.popoutStreamAccesses = state.popoutStreamAccesses.filter(
        (popoutStreamAccess) => popoutStreamAccess.token !== payload
      );
    },
    setDisableRemoteVideos: (state, { payload }: PayloadAction<boolean>) => {
      state.qualityCap = payload ? VideoSetting.Off : VideoSetting.High;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(joinSuccess, (state, { payload }) => {
      state.accessToken = payload.livekit?.token;
      state.publicUrl = payload.livekit?.publicUrl;
    });
    builder.addCase(hangUp.fulfilled, (state) => {
      state.accessToken = undefined;
      state.unavailable = false;
    });
    builder.addCase(hangUp.rejected, (state) => {
      state.accessToken = undefined;
    });
    builder.addCase(setLivekitUnavailable, (state, { payload }) => {
      state.unavailable = payload;
    });
  },
});

export const {
  addPopoutStreamAccess,
  setLivekitPopoutStreamAccessToken,
  deleteLivekitPopoutStreamAccessToken,
  setDisableRemoteVideos,
  setNewAccessToken,
} = livekitSlice.actions;

export const selectLivekitUnavailable = (state: RootState) => state.livekit.unavailable;
export const selectLivekitAccessToken = (state: RootState) => state.livekit.accessToken;
export const selectLivekitPublicUrl = (state: RootState) => state.livekit.publicUrl;
export const selectLivekitPopoutStreamAccessByParticipantId = createSelector(
  [
    (state: RootState) => state.livekit.popoutStreamAccesses,
    (_state: RootState, participantId: string) => participantId,
  ],
  (popoutStreamAccess, participantId) => {
    return popoutStreamAccess.find(
      (popoutStreamAccess) =>
        popoutStreamAccess.mediaDescriptor.participantId === participantId && popoutStreamAccess.token !== undefined
    );
  }
);

export const selectQualityCap = (state: RootState) => state.livekit.qualityCap;

export default livekitSlice.reducer;

export const livekitMiddleware = createListenerMiddleware<RootState, AppDispatch>();

const BASE_RETRY_DELAY = 500;
const MAX_RETRY_DELAY = 20000;
const RECONNECT_INDICATOR_THRESHOLD = 0;

const reconnect = (listenerApi: ListenerEffectAPI<RootState, AppDispatch>) => {
  let attempt = 0;
  const calculateDelay = (attempt: number) => Math.min(BASE_RETRY_DELAY * 2 ** attempt, MAX_RETRY_DELAY);

  const tryReconnect = async () => {
    while (getLivekitRoom().state === 'disconnected') {
      if (attempt === RECONNECT_INDICATOR_THRESHOLD) {
        listenerApi.dispatch(setLivekitUnavailable(true));
      }
      if (attempt > RECONNECT_INDICATOR_THRESHOLD) {
        listenerApi.dispatch(createNewAccessToken.action());
      }

      attempt++;
      const delay = calculateDelay(attempt);

      console.debug(`Trying to reconnect to LiveKit room, attempt ${attempt}, delay ${delay}`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    listenerApi.dispatch(setLivekitUnavailable(false));
  };

  tryReconnect().catch((error) => {
    console.error('Failed to reconnect to LiveKit:', error);
  });
};

livekitMiddleware.startListening({
  type: 'livekit/triggerReconnect',
  effect: (_, listenerApi: ListenerEffectAPI<RootState, AppDispatch>) => {
    if (!listenerApi.getState().room.isDeleted) {
      reconnect(listenerApi);
    }
  },
});
