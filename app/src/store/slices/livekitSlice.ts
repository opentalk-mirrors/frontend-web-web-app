// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
// Redux has limitations with non-serializable data, like the LiveKit room object, as it can cause issues with state persistence.
// Either way room object would be kept in the store for reference. All updated on the room object should be listened and react to on the room middlware actions and listeners.
import { ParticipantPermission } from '@livekit/protocol';
import {
  createAction,
  createSelector,
  createSlice,
  Draft,
  isAnyOf,
  ListenerEffectAPI,
  PayloadAction,
} from '@reduxjs/toolkit';
import { t } from 'i18next';
import {
  ConnectionQuality,
  DeviceUnsupportedError,
  DisconnectReason,
  ConnectionState as LivekitConnectionState,
  LocalAudioTrack,
  LocalParticipant,
  LocalTrackPublication,
  LocalVideoTrack,
  Participant,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  Room,
  RoomEvent,
  RoomEventCallbacks,
  Track,
  TrackPublication,
} from 'livekit-client';

import { Credentials } from '../../api/types/incoming/livekit';
import { createNewAccessToken } from '../../api/types/outgoing/livekit';
import { leaveWhisperGroup } from '../../api/types/outgoing/subroomAudio';
import { notifications } from '../../commonComponents';
import { LIVEKIT_SCREEN_SHARE_PERMISSION_NUMBER } from '../../constants';
import LayoutOptions from '../../enums/LayoutOptions';
import log from '../../logger';
import { MediaDescriptor } from '../../modules/WebRTC';
import { ParticipantId, TimerStyle, VideoSetting } from '../../types';
import { BackgroundEffect } from '../../types/livekit';
import { insertItem, removeItem } from '../../utils/reduxUtils';
import {
  changeLocalMedia,
  changeMedia,
  connectRoom,
  disconnectRoom,
  hangUp,
  joinSuccess,
  setBackgroundEffects,
  setScreenShareEnabled,
  switchActiveDevice,
  switchLocalDevice,
  switchScreenShare,
} from '../commonActions';
import type { AppDispatch, RootState } from '../index';
import type { StartAppListening } from '../listenerMiddleware';
import { selectAllOnlineParticipantsInConference, selectParticipantName } from './participantsSlice';
import { abortedReconnection, enteredWaitingRoom } from './roomSlice';
import { resetSubroomAudioData, setSubroomAudioData } from './subroomAudioSlice';
import { timerStarted } from './timerSlice';
import { pinnedParticipantIdSet, pinnedRemoteScreenshare, updatedCinemaLayout } from './uiSlice';

type WritableDraft<T> = {
  -readonly [K in keyof T]: Draft<T[K]>;
};

type PopoutStreamAccess = {
  mediaDescriptor: MediaDescriptor;
  token: string | undefined;
};

type PopoutStreamAccesses = Array<PopoutStreamAccess>;

const EAVESDROP_CHECK_TIMEOUT = 5000;
export type MediaDeviceKindExtended = MediaDeviceKind | 'screenshare';

export type MediaSettings = {
  microphoneEnabled: boolean;
  cameraEnabled: boolean;
  screenShareEnabled: boolean;
  videoDeviceId?: string;
  audioDeviceId?: string;
};

export type Lobby = {
  audioTrackPublication?: LocalAudioTrack;
  videoTrackPublication?: LocalVideoTrack;
};

export type LivekitState = {
  unavailable: boolean;
  accessToken: string | undefined;
  publicUrl: string | undefined;
  popoutStreamAccesses: PopoutStreamAccesses;
  qualityCap: VideoSetting;
  isPopoutStream: boolean;
  mediaChangeInProgress?: MediaDeviceKindExtended[];
  room: Room | undefined;
  whisperRoom: Room | undefined;
  permissionDenied: MediaDeviceKindExtended[] | undefined;
  videoBackgroundEffects: BackgroundEffect;
  mediaSettings: MediaSettings;
  lobby: Lobby;
  reconnectLoop: {
    active: boolean;
    attempt: number;
    timerId: number | null;
    nextDelayMs: number | null;
  };
};

export const initialState: LivekitState = {
  unavailable: false,
  accessToken: undefined,
  publicUrl: undefined,
  popoutStreamAccesses: [],
  qualityCap: VideoSetting.High,
  isPopoutStream: false,
  mediaChangeInProgress: [],
  room: undefined,
  whisperRoom: undefined,
  permissionDenied: undefined,
  videoBackgroundEffects: { style: 'off', loading: false },
  mediaSettings: {
    microphoneEnabled: false,
    cameraEnabled: false,
    screenShareEnabled: false,
    audioDeviceId: 'default',
    videoDeviceId: 'default',
  },
  lobby: {
    audioTrackPublication: undefined,
    videoTrackPublication: undefined,
  },
  reconnectLoop: { active: false, attempt: 0, timerId: null, nextDelayMs: null },
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
        log.warn('cant find popoutStreamAccess to add token');
      }
    },
    setLivekitRoom: (
      state,
      {
        payload: { room, isWhisperRoom },
      }: PayloadAction<{
        room: Room | undefined;
        isWhisperRoom?: boolean;
      }>
    ) => {
      if (isWhisperRoom) {
        state.whisperRoom = room as WritableDraft<Room>;
        return;
      }
      state.room = room as WritableDraft<Room>;
    },
    deleteLivekitPopoutStreamAccessToken: (state, { payload }: PayloadAction<string>) => {
      state.popoutStreamAccesses = state.popoutStreamAccesses.filter(
        (popoutStreamAccess) => popoutStreamAccess.token !== payload
      );
    },
    setDisableRemoteVideos: (state, { payload }: PayloadAction<boolean>) => {
      state.qualityCap = payload ? VideoSetting.Off : VideoSetting.High;
    },
    setMediaChangeInProgress: (state, { payload }: PayloadAction<MediaDeviceKind>) => {
      state.mediaChangeInProgress = insertItem(state.mediaChangeInProgress, payload);
    },
    setMediaChangeFailed: (state, { payload }: PayloadAction<MediaDeviceKind>) => {
      state.mediaChangeInProgress = removeItem(state.mediaChangeInProgress, payload);
      state.permissionDenied = insertItem(state.permissionDenied, payload);
    },
    startReconnectLoop: (state) => {
      if (state.reconnectLoop.active) {
        return;
      }
      state.reconnectLoop.active = true;
      state.reconnectLoop.attempt = 0;
      state.reconnectLoop.nextDelayMs = 0;
    },
    scheduledReconnectAttempt: (state, { payload }: PayloadAction<{ timerId: number; delay: number }>) => {
      if (!state.reconnectLoop.active) {
        return;
      }
      if (state.reconnectLoop.timerId && state.reconnectLoop.timerId !== payload.timerId) {
        clearTimeout(state.reconnectLoop.timerId);
      }
      state.reconnectLoop.timerId = payload.timerId;
      state.reconnectLoop.nextDelayMs = payload.delay;
    },
    incrementReconnectAttempt: (state) => {
      if (!state.reconnectLoop.active) {
        return;
      }
      state.reconnectLoop.attempt += 1;
    },
    abortReconnectLoop: (state) => {
      if (state.reconnectLoop.timerId) {
        clearTimeout(state.reconnectLoop.timerId);
      }
      state.reconnectLoop = { active: false, attempt: 0, timerId: null, nextDelayMs: null };
      state.unavailable = false;
    },
    finishReconnectLoop: (state) => {
      if (state.reconnectLoop.timerId) {
        clearTimeout(state.reconnectLoop.timerId);
      }
      state.reconnectLoop = { active: false, attempt: 0, timerId: null, nextDelayMs: null };
      state.unavailable = false;
    },
    cleanMediaSettingsState: (state) => {
      state.mediaSettings.cameraEnabled = false;
      state.mediaSettings.microphoneEnabled = false;
      state.mediaSettings.screenShareEnabled = false;
    },
    setMediaSettingsAudioEnabled: (state, { payload }: PayloadAction<boolean>) => {
      state.mediaSettings.microphoneEnabled = payload;
    },
    setMediaSettingVideoEnabled: (state, { payload }: PayloadAction<boolean>) => {
      state.mediaSettings.cameraEnabled = payload;
    },
    setMediaSettingScreenShareEnabled: (state, { payload }: PayloadAction<boolean>) => {
      state.mediaSettings.screenShareEnabled = payload;
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
    builder.addCase(cleanLocalTracks, (state) => {
      state.lobby.audioTrackPublication?.stop();
      state.lobby.audioTrackPublication = undefined;
      state.lobby.videoTrackPublication?.stop();
      state.lobby.videoTrackPublication = undefined;
    });
    builder.addCase(hangUp.rejected, (state) => {
      state.accessToken = undefined;
    });
    builder.addCase(setLivekitUnavailable, (state, { payload }) => {
      state.unavailable = payload;
    });
    builder.addCase(changeLocalMedia.pending, (state, { meta: { arg } }) => {
      state.mediaChangeInProgress = insertItem(state.mediaChangeInProgress, arg.kind);
    });
    builder.addCase(changeLocalMedia.rejected, (state, { meta: { arg } }) => {
      state.mediaChangeInProgress = removeItem(state.mediaChangeInProgress, arg.kind);
      state.permissionDenied = insertItem(state.permissionDenied, arg.kind);
    });
    builder.addCase(changeLocalMedia.fulfilled, (state, { payload, meta: { arg } }) => {
      state.mediaChangeInProgress = removeItem(state.mediaChangeInProgress, arg.kind);
      state.permissionDenied = removeItem(state.permissionDenied, arg.kind);
      updateLobbyTrack(state.lobby as Lobby, arg.kind, payload.deviceId, payload.track, state as LivekitState);
    });
    builder.addCase(changeMedia.pending, (state, { meta: { arg } }) => {
      state.mediaChangeInProgress = insertItem(state.mediaChangeInProgress, arg.kind);
    });
    builder.addCase(changeMedia.rejected, (state, { meta: { arg } }) => {
      state.mediaChangeInProgress = removeItem(state.mediaChangeInProgress, arg.kind);
      state.permissionDenied = insertItem(state.permissionDenied, arg.kind);
    });
    builder.addCase(changeMedia.fulfilled, (state, { meta: { arg } }) => {
      state.mediaChangeInProgress = removeItem(state.mediaChangeInProgress, arg.kind);
      state.permissionDenied = removeItem(state.permissionDenied, arg.kind);
    });
    builder.addCase(setScreenShareEnabled.pending, (state) => {
      state.mediaChangeInProgress = insertItem(state.mediaChangeInProgress, 'screenshare');
    });
    builder.addCase(setScreenShareEnabled.rejected, (state) => {
      state.mediaChangeInProgress = removeItem(state.mediaChangeInProgress, 'screenshare');
      state.permissionDenied = insertItem(state.permissionDenied, 'screenshare');
    });
    builder.addCase(switchScreenShare.pending, (state) => {
      state.mediaChangeInProgress = insertItem(state.mediaChangeInProgress, 'screenshare');
    });
    builder.addCase(switchScreenShare.rejected, (state) => {
      state.mediaChangeInProgress = removeItem(state.mediaChangeInProgress, 'screenshare');
      state.permissionDenied = insertItem(state.permissionDenied, 'screenshare');
    });
    builder.addCase(switchScreenShare.fulfilled, (state) => {
      state.mediaChangeInProgress = removeItem(state.mediaChangeInProgress, 'screenshare');
      state.permissionDenied = removeItem(state.permissionDenied, 'screenshare');
      state.mediaSettings.screenShareEnabled = state.room?.localParticipant.isScreenShareEnabled || false;
    });
    builder.addCase(setBackgroundEffects.pending, (state) => {
      state.videoBackgroundEffects.loading = true;
    });
    builder.addCase(setBackgroundEffects.rejected, (state) => {
      state.videoBackgroundEffects.loading = false;
      state.permissionDenied = insertItem(state.permissionDenied, 'screenshare');
    });
    builder.addCase(setBackgroundEffects.fulfilled, (state, { meta: { arg } }) => {
      state.videoBackgroundEffects = { ...arg, loading: false };
    });
    builder.addCase(setScreenShareEnabled.fulfilled, (state) => {
      state.mediaChangeInProgress = removeItem(state.mediaChangeInProgress, 'screenshare');
      state.permissionDenied = removeItem(state.permissionDenied, 'screenshare');
    });
    builder.addCase(switchActiveDevice.fulfilled, (state, { meta: { arg } }) => {
      if (arg.kind === 'audioinput') {
        state.mediaSettings.audioDeviceId = arg.deviceId;
      }
      if (arg.kind === 'videoinput') {
        state.mediaSettings.videoDeviceId = arg.deviceId;
      }
    });
    builder.addCase(switchLocalDevice.fulfilled, (state, { payload, meta: { arg } }) => {
      updateLobbyTrack(state.lobby as Lobby, arg.kind, arg.deviceId, payload.track, state as LivekitState);
    });
    builder.addCase(startBroadcastRoom, (state) => {
      state.isPopoutStream = true;
    });
  },
});

export const {
  addPopoutStreamAccess,
  setLivekitPopoutStreamAccessToken,
  deleteLivekitPopoutStreamAccessToken,
  setDisableRemoteVideos,
  setNewAccessToken,
  setLivekitRoom,
  startReconnectLoop,
  scheduledReconnectAttempt,
  incrementReconnectAttempt,
  abortReconnectLoop,
  finishReconnectLoop,
  cleanMediaSettingsState,
  setMediaSettingsAudioEnabled,
  setMediaSettingVideoEnabled,
  setMediaSettingScreenShareEnabled,
} = livekitSlice.actions;

export const setLivekitUnavailable = createAction<boolean>('livekit/set_livekit_unavailable');
export const startBroadcastRoom = createAction<{ accessToken?: string; participantId?: ParticipantId }>(
  'livekit/start_broadcast_room'
);
export const cleanLocalTracks = createAction('livekit/clean_local_tracks');
export const triggerLivekitReconnect = createAction('livekit/triggerReconnect');

export const selectLivekitUnavailable = (state: RootState) => state.livekit.unavailable;
export const selectLivekitAccessToken = (state: RootState) => state.livekit.accessToken;
export const selectLivekitPublicUrl = (state: RootState) => state.livekit.publicUrl;
export const selectLivekitWhisperRoom = (state: RootState) => state.livekit.whisperRoom;
export const selectLivekitRoom = (state: RootState) => state.livekit.room;
export const selectScreenShareEnabled = (state: RootState) => state.livekit.mediaSettings.screenShareEnabled;
export const selectAudioEnabled = (state: RootState) => state.livekit.mediaSettings.microphoneEnabled;
export const selectVideoEnabled = (state: RootState) => state.livekit.mediaSettings.cameraEnabled;

export const selectAudioDeviceId = (state: RootState) => state.livekit.mediaSettings?.audioDeviceId;
export const selectVideoDeviceId = (state: RootState) => state.livekit.mediaSettings?.videoDeviceId;
export const selectLobbyAudioTrack = (state: RootState) => state.livekit.lobby.audioTrackPublication;
export const selectLobbyVideoTrack = (state: RootState) => state.livekit.lobby.videoTrackPublication;
export const selectLobbyVideoEnabled = (state: RootState) => Boolean(state.livekit.lobby.videoTrackPublication);
export const selectLobbyAudioEnabled = (state: RootState) => Boolean(state.livekit.lobby.audioTrackPublication);
export const selectVideoBackgroundEffects = (state: RootState) => state.livekit?.videoBackgroundEffects;

export const selectAudioPermissionDenied = (state: RootState) =>
  Boolean(state.livekit?.permissionDenied?.find((kind) => kind === 'audioinput'));
export const selectVideoPermissionDenied = (state: RootState) =>
  Boolean(state.livekit?.permissionDenied?.find((kind) => kind === 'videoinput'));
export const selectScreensharePermissionDenied = (state: RootState) =>
  Boolean(state.livekit?.permissionDenied?.find((kind) => kind === 'screenshare'));

export const selectAudioChangeInProgress = (state: RootState) =>
  Boolean(state.livekit.mediaChangeInProgress?.find((kind) => kind === 'audioinput'));
export const selectVideoChangeInProgress = (state: RootState) =>
  Boolean(state.livekit.mediaChangeInProgress?.find((kind) => kind === 'videoinput'));
export const selectScreenshareChangeInProgress = (state: RootState) =>
  Boolean(state.livekit.mediaChangeInProgress?.find((kind) => kind === 'screenshare'));

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
export const selectIsPopoutStream = (state: RootState) => state.livekit.isPopoutStream;

export default livekitSlice.reducer;

function updateLobbyTrack(
  lobby: Lobby,
  kind: string,
  deviceId: string | undefined,
  track: LocalAudioTrack | LocalVideoTrack | undefined,
  state: LivekitState
) {
  if (kind === 'audioinput') {
    state.mediaSettings.audioDeviceId = deviceId;
    lobby.audioTrackPublication?.stop();
    lobby.audioTrackPublication = undefined;
    if (track instanceof LocalAudioTrack) {
      lobby.audioTrackPublication = track;
    }
  }
  if (kind === 'videoinput') {
    state.mediaSettings.videoDeviceId = deviceId;
    lobby.videoTrackPublication?.stop();
    lobby.videoTrackPublication = undefined;
    if (track instanceof LocalVideoTrack) {
      lobby.videoTrackPublication = track;
    }
  }
}
/************************************************/
/*                                              */
/*                  Listeners                   */
/*                                              */
/************************************************/
const startConnectLivekitListeners = (startAppListening: StartAppListening) => {
  startAppListening({
    actionCreator: connectRoom.fulfilled,
    effect: async (
      {
        payload: { room },
        meta: {
          arg: { isWhisperRoom },
        },
      },
      listenerApi
    ) => {
      attachRoomListeners(listenerApi.dispatch, listenerApi.getState, room);
      listenerApi.dispatch(setLivekitRoom({ room, isWhisperRoom }));
    },
  });
};

const startJoinSuccessListeners = (startAppListening: StartAppListening) => {
  startAppListening({
    actionCreator: joinSuccess,
    effect: async (action, listenerApi) => {
      const eventInfo = action.payload.eventInfo;
      listenerApi.dispatch(connectRoom({ isWhisperRoom: false, eventInfo }));
    },
  });
};

const startSubroomAudioDataListeners = (startAppListening: StartAppListening) => {
  startAppListening({
    actionCreator: setSubroomAudioData,
    effect: async (_, listenerApi) => {
      listenerApi.dispatch(connectRoom({ isWhisperRoom: true }));
    },
  });
};

const startBroadcastRoomListeners = (startAppListening: StartAppListening) => {
  startAppListening({
    actionCreator: startBroadcastRoom,
    effect: async (action, listenerApi) => {
      listenerApi.dispatch(connectRoom({ isWhisperRoom: false, accessToken: action.payload.accessToken }));
    },
  });
};

const startAbortReconnectListeners = (startAppListening: StartAppListening) => {
  startAppListening({
    actionCreator: abortedReconnection,
    effect: async (action, listenerApi) => {
      listenerApi.dispatch(disconnectRoom({ isWhisperRoom: false }));
    },
  });
};

const startHangUpListeners = (startAppListening: StartAppListening) =>
  startAppListening({
    actionCreator: hangUp.fulfilled,
    effect: async (_, listenerApi) => {
      listenerApi.dispatch(disconnectRoom({ isWhisperRoom: false }));
    },
  });

const startResetSubroomListeners = (startAppListening: StartAppListening) => {
  startAppListening({
    actionCreator: resetSubroomAudioData,
    effect: async (_, listenerApi) => {
      listenerApi.dispatch(disconnectRoom({ isWhisperRoom: true }));
    },
  });
};

const startLeaveWhisperGroupListeners = (startAppListening: StartAppListening) => {
  startAppListening({
    actionCreator: leaveWhisperGroup.action,
    effect: async (_, listenerApi) => {
      listenerApi.dispatch(disconnectRoom({ isWhisperRoom: true }));
    },
  });
};

const startReconnectOnLivekitTriggerListener = (startAppListening: StartAppListening) => {
  startAppListening({
    type: triggerLivekitReconnect.type,
    effect: (_, listenerApi: ListenerEffectAPI<RootState, AppDispatch>) => {
      const state = listenerApi.getState();
      if (state.room.isDeleted) {
        return;
      }
      const room = state.livekit.room;
      if ((room?.state === 'disconnected' || room === undefined) && !state.livekit.reconnectLoop.active) {
        listenerApi.dispatch(startReconnectLoop());
        listenerApi.dispatch(scheduleNextReconnect());
      }
    },
  });
};

const startDisableMediaOnCoffeeBreakListener = (startAppListening: StartAppListening) =>
  startAppListening({
    actionCreator: timerStarted,
    effect: (action, listenerApi) => {
      const state = listenerApi.getState();
      const isAnyMediaTrackEnabled = selectAudioEnabled(state) || selectVideoEnabled(state);
      const isShareScreenEnabled = selectScreenShareEnabled(state);

      if (action.payload.style === TimerStyle.CoffeeBreak) {
        if (isAnyMediaTrackEnabled) {
          listenerApi.dispatch(changeMedia({ kind: 'audioinput', enabled: false }));
          listenerApi.dispatch(changeMedia({ kind: 'videoinput', enabled: false }));
        }
        if (isShareScreenEnabled) {
          listenerApi.dispatch(setScreenShareEnabled({ enabled: false }));
        }
      }
    },
  });

const startDisableMediaOnWaitingRoomListener = (startAppListening: StartAppListening) =>
  startAppListening({
    actionCreator: enteredWaitingRoom,
    effect: (_, listenerApi) => {
      listenerApi.dispatch(changeMedia({ kind: 'audioinput', enabled: false }));
      listenerApi.dispatch(changeMedia({ kind: 'videoinput', enabled: false }));
      listenerApi.dispatch(setScreenShareEnabled({ enabled: false }));
    },
  });

const startMediaChoiceListener = (startAppListening: StartAppListening) =>
  startAppListening({
    matcher: isAnyOf(setBackgroundEffects.fulfilled, switchActiveDevice.fulfilled, switchLocalDevice.fulfilled),
    effect: (_, listenerApi) => {
      const { videoBackgroundEffects } = listenerApi.getState().livekit;
      const { videoDeviceId, audioDeviceId } = listenerApi.getState().livekit.mediaSettings;
      const updatedChoices = {
        videoBackgroundEffects,
        mediaSettings: {
          videoDeviceId,
          audioDeviceId,
        },
      };
      localStorage.setItem('mediaChoices', JSON.stringify(updatedChoices));
    },
  });

const startNewAccessTokenListener = (startAppListening: StartAppListening) =>
  startAppListening({
    actionCreator: setNewAccessToken,
    effect: (action, listenerApi) => {
      const state = listenerApi.getState();
      if (!state.livekit.room) {
        listenerApi.dispatch(
          connectRoom({ eventInfo: state.room.eventInfo, isWhisperRoom: false, accessToken: action.payload.token })
        );
      }
    },
  });

const BASE_RETRY_DELAY = 500; // ms
const MAX_RETRY_DELAY = 20000; // ms
const RECONNECT_INDICATOR_THRESHOLD = 0;
const calculateReconnectDelay = (attempt: number) => Math.min(BASE_RETRY_DELAY * 2 ** attempt, MAX_RETRY_DELAY);

const scheduleNextReconnect = () => ({ type: 'livekit/reconnect/scheduleNext' });
const reconnectTick = () => ({ type: 'livekit/reconnect/tick' });

const startReconnectLoopListeners = (startAppListening: StartAppListening) => {
  startAppListening({
    type: scheduleNextReconnect().type,
    effect: (_, listenerApi) => {
      const state = listenerApi.getState();
      const loop = state.livekit.reconnectLoop;
      if (!loop.active) {
        return;
      }
      const room = state.livekit.room;
      if (room && room.state !== 'disconnected') {
        listenerApi.dispatch(finishReconnectLoop());
        return;
      }
      const delay = calculateReconnectDelay(loop.attempt);
      if (loop.attempt === RECONNECT_INDICATOR_THRESHOLD) {
        listenerApi.dispatch(setLivekitUnavailable(true));
      }
      if (loop.attempt > RECONNECT_INDICATOR_THRESHOLD) {
        listenerApi.dispatch(createNewAccessToken.action());
      }
      log.debug(`Scheduling LiveKit reconnect attempt #${loop.attempt} in ${delay}ms`);
      const timerId = window.setTimeout(() => {
        listenerApi.dispatch(reconnectTick());
      }, delay);
      listenerApi.dispatch(scheduledReconnectAttempt({ timerId, delay }));
    },
  });

  // Tick handler
  startAppListening({
    type: reconnectTick().type,
    effect: (_, listenerApi) => {
      const state = listenerApi.getState();
      const loop = state.livekit.reconnectLoop;
      if (!loop.active) {
        return;
      }
      const room = state.livekit.room;
      if (room && room.state !== 'disconnected') {
        listenerApi.dispatch(finishReconnectLoop());
        return;
      }
      listenerApi.dispatch(incrementReconnectAttempt());
      listenerApi.dispatch(scheduleNextReconnect());
    },
  });
};

const startReconnectAbortListeners = (startAppListening: StartAppListening) => {
  startAppListening({
    actionCreator: hangUp.fulfilled,
    effect: (_, listenerApi) => {
      if (listenerApi.getState().livekit.reconnectLoop.active) {
        listenerApi.dispatch(abortReconnectLoop());
      }
    },
  });
  startAppListening({
    actionCreator: disconnectRoom.fulfilled,
    effect: (_, listenerApi) => {
      if (listenerApi.getState().livekit.reconnectLoop.active) {
        listenerApi.dispatch(abortReconnectLoop());
      }
    },
  });
  startAppListening({
    actionCreator: enteredWaitingRoom,
    effect: (_, listenerApi) => {
      if (listenerApi.getState().livekit.reconnectLoop.active) {
        listenerApi.dispatch(abortReconnectLoop());
      }
    },
  });
};

export const startLivekitListeners = (startAppListening: StartAppListening) => {
  startConnectLivekitListeners(startAppListening);
  startLeaveWhisperGroupListeners(startAppListening);
  startResetSubroomListeners(startAppListening);
  startHangUpListeners(startAppListening);
  startSubroomAudioDataListeners(startAppListening);
  startJoinSuccessListeners(startAppListening);
  startReconnectOnLivekitTriggerListener(startAppListening);
  startDisableMediaOnCoffeeBreakListener(startAppListening);
  startMediaChoiceListener(startAppListening);
  startDisableMediaOnWaitingRoomListener(startAppListening);
  startBroadcastRoomListeners(startAppListening);
  startReconnectLoopListeners(startAppListening);
  startReconnectAbortListeners(startAppListening);
  startNewAccessTokenListener(startAppListening);
  startAbortReconnectListeners(startAppListening);
};

/************************************************/
/*                                              */
/*             Livekit room listeners           */
/*                                              */
/************************************************/
const roomListeners = new WeakMap<Room, Partial<RoomEventCallbacks>>();

const createRoomListeners = (
  dispatch: AppDispatch,
  getState: () => RootState,
  room: Room
): Partial<RoomEventCallbacks> => ({
  [RoomEvent.Connected]: () => {
    handleRoomConnected(dispatch, getState);
    handleParticipantConnected(getState);
  },
  [RoomEvent.Disconnected]: (reason) => handleRoomDisconnected(dispatch, getState, room, reason),
  [RoomEvent.TrackPublished]: (pub, participant) => {
    if (participant instanceof RemoteParticipant && pub instanceof RemoteTrackPublication) {
      handleTrackPublished(pub, participant, dispatch);
    }
  },
  [RoomEvent.TrackUnpublished]: (pub, participant) => {
    if (participant instanceof RemoteParticipant && pub instanceof RemoteTrackPublication) {
      handleRemoteTrackUnpublished(pub, participant, dispatch, getState);
    }
  },
  [RoomEvent.LocalTrackUnpublished]: (pub) => handleTrackToggle(pub, room, dispatch, getState, false),
  [RoomEvent.TrackSubscribed]: (track, pub, participant) => handleTrackSubscribed(track, pub, participant),
  [RoomEvent.ParticipantPermissionsChanged]: (previousPermissions, participant) =>
    handlePermissionChanged(previousPermissions, participant as RemoteParticipant | LocalParticipant, dispatch),
  [RoomEvent.TrackMuted]: (pub, participant) => handleTrackToggle(pub, room, dispatch, getState, false, participant),
  [RoomEvent.TrackUnmuted]: (pub, participant) => handleTrackToggle(pub, room, dispatch, getState, true, participant),
  [RoomEvent.LocalTrackPublished]: (pub) => handleTrackToggle(pub, room, dispatch, getState, true),
  [RoomEvent.ConnectionStateChanged]: () => handleConnectionStateChanged(dispatch, getState),
  [RoomEvent.EncryptionError]: (error) => handleEncryptionError(error),
  [RoomEvent.ParticipantConnected]: (participant) => handleParticipantConnected(getState, participant),
});

const attachRoomListeners = (dispatch: AppDispatch, getState: () => RootState, room: Room) => {
  const listeners = createRoomListeners(dispatch, getState, room);
  roomListeners.set(room, listeners);

  Object.entries(listeners).forEach(([eventName, callback]) => {
    room.on(eventName as RoomEvent, callback);
  });
};

const detachRoomListeners = (room: Room) => {
  const listeners = roomListeners.get(room);
  if (!listeners) {
    return;
  }
  Object.entries(listeners).forEach(([eventName, callback]) => {
    room.off(eventName as RoomEvent, callback);
  });
  roomListeners.delete(room);
};

const handleRoomConnected = async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setLivekitUnavailable(false));
  dispatch(finishReconnectLoop());
  const state = getState();
  const isLobbyCameraEnabled = selectLobbyVideoEnabled(state);
  const isLobbyMicrophoneEnabled = selectLobbyAudioEnabled(state);

  if (isLobbyCameraEnabled) {
    dispatch(changeMedia({ kind: 'videoinput', enabled: isLobbyCameraEnabled }));
  }
  if (isLobbyMicrophoneEnabled) {
    dispatch(changeMedia({ kind: 'audioinput', enabled: isLobbyMicrophoneEnabled }));
  }
  dispatch(cleanLocalTracks());
};

const handleClientOrUserDisconnect = (dispatch: AppDispatch, getState: () => RootState, room: Room) => {
  const isWhisperRoom = getState().livekit.whisperRoom?.name === room.name;
  if (!isWhisperRoom) {
    dispatch(cleanMediaSettingsState());
  }
  detachRoomListeners(room);
  dispatch(setLivekitRoom({ room: undefined, isWhisperRoom }));
};

function handleServerOrSignalDisconnect(dispatch: AppDispatch) {
  dispatch(triggerLivekitReconnect());
}

const handleRoomDisconnected = (
  dispatch: AppDispatch,
  getState: () => RootState,
  room: Room,
  reason?: DisconnectReason
) => {
  switch (reason) {
    case DisconnectReason.CLIENT_INITIATED:
    case DisconnectReason.DUPLICATE_IDENTITY:
    case DisconnectReason.PARTICIPANT_REMOVED:
    case DisconnectReason.ROOM_DELETED:
    case DisconnectReason.ROOM_CLOSED:
    case DisconnectReason.USER_REJECTED:
    case DisconnectReason.USER_UNAVAILABLE:
      handleClientOrUserDisconnect(dispatch, getState, room);
      break;
    case DisconnectReason.SERVER_SHUTDOWN:
    case DisconnectReason.SIGNAL_CLOSE:
    case DisconnectReason.MIGRATION:
    case DisconnectReason.CONNECTION_TIMEOUT:
    case DisconnectReason.MEDIA_FAILURE:
    case DisconnectReason.STATE_MISMATCH:
      handleServerOrSignalDisconnect(dispatch);
      break;
    default:
      handleServerOrSignalDisconnect(dispatch);
      log.warn('Unknown LiveKit disconnect reason:', reason);
  }
};

const handleTrackToggle = (
  pub: TrackPublication | LocalTrackPublication,
  room: Room,
  dispatch: AppDispatch,
  getState: () => RootState,
  enabled: boolean,
  participant?: Participant
) => {
  const state = getState();
  const isTrackFromLocalParticipant = participant?.identity === state.user.uuid;
  const isLocalTrackPublication = pub instanceof LocalTrackPublication;
  const isWhisperRoom = state.livekit.whisperRoom?.name === room.name;
  if (isWhisperRoom) {
    return;
  }
  if (isTrackFromLocalParticipant || isLocalTrackPublication) {
    if (pub.kind === Track.Kind.Audio) {
      if (pub.source === Track.Source.ScreenShareAudio) {
        // we don't manage screen share audio state here
        return;
      }
      dispatch(setMediaSettingsAudioEnabled(enabled));
    }
    if (pub.kind === Track.Kind.Video) {
      if (pub.source === Track.Source.ScreenShare) {
        dispatch(setMediaSettingScreenShareEnabled(enabled));
        return;
      }
      dispatch(setMediaSettingVideoEnabled(enabled));
    }
  }
};

const handleEncryptionError = (error: Error) => {
  if (error instanceof DeviceUnsupportedError) {
    notifications.error(t('unsupported-browser-e2e-encryption-dialog-message'));
  }
};

const handleTrackPublished = (pub: RemoteTrackPublication, participant: RemoteParticipant, dispatch: AppDispatch) => {
  if (pub.source === Track.Source.ScreenShare) {
    dispatch(pinnedRemoteScreenshare(participant.identity as ParticipantId));
    dispatch(updatedCinemaLayout({ layout: LayoutOptions.Speaker }));
  }
};

const handleRemoteTrackUnpublished = (
  pub: RemoteTrackPublication,
  participant: RemoteParticipant,
  dispatch: AppDispatch,
  getState: () => RootState
) => {
  const state = getState();
  if (pub.source === Track.Source.ScreenShare && participant.identity === state.ui.pinnedParticipantId) {
    dispatch(pinnedParticipantIdSet(undefined));
    dispatch(updatedCinemaLayout({ layout: state.ui.lastCinemaLayout }));
  }
};

const handleTrackSubscribed = (_: RemoteTrack, pub: RemoteTrackPublication, participant: RemoteParticipant) => {
  if (pub.isEncrypted) {
    log.debug(`subscribed encrypted ${pub.kind} stream from user with ID:`, participant.identity);
  }
};

const handlePermissionChanged = (
  previousPermissions: ParticipantPermission | undefined,
  participant: RemoteParticipant | LocalParticipant,
  dispatch: AppDispatch
) => {
  if (!participant.isLocal) {
    return;
  }

  const currentPermissions = participant.permissions?.canPublishSources;
  if (previousPermissions && currentPermissions) {
    const changed = currentPermissions?.filter((item) => previousPermissions.canPublishSources.indexOf(item) < 0);

    const hadScreenShare = previousPermissions.canPublishSources.includes(LIVEKIT_SCREEN_SHARE_PERMISSION_NUMBER);
    const hasScreenShare = currentPermissions?.includes(LIVEKIT_SCREEN_SHARE_PERMISSION_NUMBER) || false;

    if (changed?.includes(LIVEKIT_SCREEN_SHARE_PERMISSION_NUMBER)) {
      notifications.close('control-participant-presenter-role-revoked');
      notifications.info(t('control-participant-presenter-role-granted'), {
        key: 'control-participant-presenter-role-granted',
      });
    } else if (!hasScreenShare && hadScreenShare) {
      dispatch(setScreenShareEnabled({ enabled: false }));
      notifications.close('control-participant-presenter-role-granted');
      notifications.warning(t('control-participant-presenter-role-revoked'), {
        key: 'control-participant-presenter-role-revoked',
      });
    }
  }
};

const handleConnectionStateChanged = (dispatch: AppDispatch, getState: () => RootState) => {
  const isLivekitUnavailable = getState().livekit.unavailable;
  const livekitState = getState().livekit.room?.state;
  if (livekitState === LivekitConnectionState.SignalReconnecting) {
    dispatch(setLivekitUnavailable(true));
  } else if (livekitState === LivekitConnectionState.Connected && isLivekitUnavailable) {
    dispatch(setLivekitUnavailable(false));
  }
};

const handleParticipantConnected = (getState: () => RootState, remoteParticipant?: Participant) => {
  setTimeout(() => {
    const state = getState();

    // If the user is in a popout stream, we don't check for unauthorized participants
    if (selectIsPopoutStream(state)) {
      return;
    }

    const disconnectedStates = [ConnectionQuality.Lost, ConnectionQuality.Unknown];
    const connectedParticipantIds = new Set(selectAllOnlineParticipantsInConference(state).map((p) => p.id));

    const isActiveAndUnauthorized = (p: Participant) =>
      !disconnectedStates.includes(p.connectionQuality) && !connectedParticipantIds.has(p.identity as ParticipantId);

    if (remoteParticipant) {
      if (isActiveAndUnauthorized(remoteParticipant)) {
        const displayName =
          selectParticipantName(state, remoteParticipant.identity as ParticipantId) || remoteParticipant.identity;
        notifications.error(t('security-breach-eavesdrop', { participants: displayName }));
      }
      return;
    }

    const remoteParticipants = Array.from(state.livekit.room?.remoteParticipants.values() || []);
    const unauthorizedParticipantNames = remoteParticipants
      .filter(isActiveAndUnauthorized)
      .map((p) => selectParticipantName(state, p.identity as ParticipantId) || p.identity);

    if (unauthorizedParticipantNames.length > 0) {
      notifications.error(t('security-breach-eavesdrop', { participants: unauthorizedParticipantNames.join(', ') }));
    }
  }, EAVESDROP_CHECK_TIMEOUT);
};
