// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { UnknownAction, Action } from '@reduxjs/toolkit';
import { get, set } from 'lodash';

import { broadcastVolatile, storeScene } from '../../api/types/outgoing/whiteboard';
import { changeLocalMedia, connectRoom, switchLocalDevice } from '../commonActions';
import type { RootState } from '../index';
import { setLivekitRoom } from '../slices/livekitSlice';

const BLOB = '<<LONG_BLOB>>' as const;

export const stateSanitizer: <S>(genericState: S, _index: number) => S = <S>(genericState: S): S => {
  let changed = false;

  const state = genericState as unknown as RootState;

  // --- fullscreen ---
  const fullscreen = state.fullscreen;
  let sanitizedFullscreen: unknown | undefined = fullscreen;
  if (fullscreen?.element != null) {
    sanitizedFullscreen = { ...fullscreen, element: BLOB };
    changed = true;
  }

  // --- livekit.lobby ---
  const lobby = state.livekit?.lobby;
  let sanitizedLobby: unknown | undefined = lobby;
  if (lobby) {
    const needsLobbyMask = lobby.audioTrackPublication != null || lobby.videoTrackPublication != null;

    if (needsLobbyMask) {
      sanitizedLobby = {
        ...lobby,
        ...(lobby.audioTrackPublication != null && { audioTrackPublication: BLOB }),
        ...(lobby.videoTrackPublication != null && { videoTrackPublication: BLOB }),
      };
      changed = true;
    }
  }

  // --- livekit.room & livekit.whisperRoom ---
  const livekit = state.livekit;
  let sanitizedLivekit: unknown | undefined = livekit;

  const needsLivekitMask = livekit?.room != null || livekit?.whisperRoom != null || sanitizedLobby !== lobby;

  if (livekit && needsLivekitMask) {
    sanitizedLivekit = {
      ...livekit,
      ...(livekit.room != null && { room: BLOB }),
      ...(livekit.whisperRoom != null && { whisperRoom: BLOB }),
      ...(sanitizedLobby !== lobby && { lobby: sanitizedLobby }),
    };
    changed = true;
  }

  if (changed) {
    return {
      ...state,
      ...(sanitizedFullscreen !== fullscreen && { fullscreen: sanitizedFullscreen }),
      ...(sanitizedLivekit !== livekit && { livekit: sanitizedLivekit }),
    } as S;
  }

  return state as S;
};

function maskPayloadKey<T extends UnknownAction, K extends string>(action: T, key: K): T {
  const payload = (action as UnknownAction).payload as Record<string, unknown> | undefined;

  if (payload === undefined) {
    return action;
  }

  const value = get(payload, key);

  if (!value || value === BLOB) {
    return action;
  }

  return {
    ...action,
    payload: set({ ...payload }, key, BLOB),
  } as T;
}

export const actionSanitizer: <A extends Action>(genericAction: A, _id: number) => A = <A>(genericAction: A): A => {
  const action = genericAction as unknown as UnknownAction;

  if (changeLocalMedia.fulfilled.match(action) || switchLocalDevice.fulfilled.match(action)) {
    return maskPayloadKey(action, 'videoTrackPublication') as A;
  }

  if (setLivekitRoom.match(action) || connectRoom.fulfilled.match(action)) {
    return maskPayloadKey(action, 'room') as A;
  }

  if (broadcastVolatile.action.match(action)) {
    return maskPayloadKey(action, 'data.pointersMap') as A;
  }

  if (storeScene.action.match(action)) {
    return maskPayloadKey(action, 'scene.appState.collaborators') as A;
  }

  return action as A;
};
