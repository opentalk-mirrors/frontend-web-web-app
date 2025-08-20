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
  ConnectionState as LivekitConnectionState,
  LocalAudioTrack,
  LocalParticipant,
  LocalVideoTrack,
  Participant,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  Room,
  RoomEvent,
  Track,
} from 'livekit-client';

import { Credentials } from '../../api/types/incoming/livekit';
import { createNewAccessToken } from '../../api/types/outgoing/livekit';
import { leaveWhisperGroup } from '../../api/types/outgoing/subroomAudio';
import { notifications } from '../../commonComponents';
import { LIVEKIT_SCREEN_SHARE_PERMISSION_NUMBER } from '../../constants';
import LayoutOptions from '../../enums/LayoutOptions';
import log from '../../logger';
import { MediaDescriptor } from '../../modules/WebRTC';
import { ConnectionState } from '../../modules/WebRTC/ConferenceRoom';
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
} from '../commonActions';
import type { AppDispatch, RootState } from '../index';
import type { StartAppListening } from '../listenerMiddleware';
import { selectAllOnlineParticipantsInConference, selectParticipantName } from './participantsSlice';
import { enteredWaitingRoom } from './roomSlice';
import { resetSubroomAudioData, setSubroomAudioData } from './subroomAudioSlice';
import { timerStarted } from './timerSlice';
import {
  pinnedParticipantIdSet,
  pinnedRemoteScreenshare,
  selectVisibleParticipantIds,
  setVisibleParticipantIds,
  updatedCinemaLayout,
} from './uiSlice';

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
  },
  lobby: {
    audioTrackPublication: undefined,
    videoTrackPublication: undefined,
  },
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
    builder.addCase(disconnectRoom.fulfilled, (state) => {
      state.mediaSettings.cameraEnabled = false;
      state.mediaSettings.microphoneEnabled = false;
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
    builder.addCase(changeLocalMedia.pending, (state, { meta }) => {
      state.mediaChangeInProgress = insertItem(state.mediaChangeInProgress, meta.arg.kind);
    });
    builder.addCase(changeLocalMedia.rejected, (state, { meta }) => {
      state.mediaChangeInProgress = removeItem(state.mediaChangeInProgress, meta.arg.kind);
      state.permissionDenied = insertItem(state.permissionDenied, meta.arg.kind);
    });

    builder.addCase(changeLocalMedia.fulfilled, (state, { payload }) => {
      state.mediaChangeInProgress = removeItem(state.mediaChangeInProgress, payload.kind);
      state.permissionDenied = removeItem(state.permissionDenied, payload.kind);
      const lobby = state.lobby as Lobby;
      if (payload.kind === 'audioinput') {
        state.mediaSettings.audioDeviceId = payload.deviceId;
        lobby.audioTrackPublication?.stop();
        lobby.audioTrackPublication = undefined;
        if (payload.track instanceof LocalAudioTrack) {
          lobby.audioTrackPublication = payload.track;
        }
      }
      if (payload.kind === 'videoinput') {
        state.mediaSettings.videoDeviceId = payload.deviceId;
        lobby.videoTrackPublication?.stop();
        lobby.videoTrackPublication = undefined;
        if (payload.track instanceof LocalVideoTrack) {
          lobby.videoTrackPublication = payload.track;
        }
      }
    });
    builder.addCase(changeMedia.pending, (state, { meta }) => {
      state.mediaChangeInProgress = insertItem(state.mediaChangeInProgress, meta.arg.kind);
    });
    builder.addCase(changeMedia.rejected, (state, { meta }) => {
      state.mediaChangeInProgress = removeItem(state.mediaChangeInProgress, meta.arg.kind);
      state.permissionDenied = insertItem(state.permissionDenied, meta.arg.kind);
    });
    builder.addCase(changeMedia.fulfilled, (state, { payload }) => {
      state.mediaChangeInProgress = removeItem(state.mediaChangeInProgress, payload.kind);
      state.permissionDenied = removeItem(state.permissionDenied, payload.kind);
      if (payload.kind === 'audioinput') {
        state.mediaSettings.microphoneEnabled = payload.enabled;
        state.mediaSettings.audioDeviceId = payload.deviceId;
      }
      if (payload.kind === 'videoinput') {
        state.mediaSettings.cameraEnabled = payload.enabled;
        state.mediaSettings.videoDeviceId = payload.deviceId;
      }
    });
    builder.addCase(setScreenShareEnabled.pending, (state) => {
      state.mediaChangeInProgress = insertItem(state.mediaChangeInProgress, 'screenshare');
    });
    builder.addCase(setScreenShareEnabled.rejected, (state) => {
      state.mediaChangeInProgress = removeItem(state.mediaChangeInProgress, 'screenshare');
      state.permissionDenied = insertItem(state.permissionDenied, 'screenshare');
    });
    builder.addCase(setBackgroundEffects.pending, (state) => {
      state.videoBackgroundEffects.loading = true;
    });
    builder.addCase(setBackgroundEffects.rejected, (state) => {
      state.videoBackgroundEffects.loading = false;
      state.permissionDenied = insertItem(state.permissionDenied, 'screenshare');
    });
    builder.addCase(setBackgroundEffects.fulfilled, (state, { payload }) => {
      state.videoBackgroundEffects = { ...payload, loading: false };
    });
    builder.addCase(setScreenShareEnabled.fulfilled, (state, { payload }) => {
      state.mediaChangeInProgress = removeItem(state.mediaChangeInProgress, 'screenshare');
      state.permissionDenied = removeItem(state.permissionDenied, 'screenshare');
      state.mediaSettings.screenShareEnabled = payload.enabled;
    });
    builder.addCase(switchActiveDevice.fulfilled, (state, { payload }) => {
      if (payload.kind === 'audioinput') {
        state.mediaSettings.audioDeviceId = payload.deviceId;
      }
      if (payload.kind === 'videoinput') {
        state.mediaSettings.videoDeviceId = payload.deviceId;
      }
    });
    builder.addCase(switchLocalDevice.fulfilled, (state, { payload }) => {
      const lobby = state.lobby as Lobby;
      if (payload.kind === 'audioinput') {
        state.mediaSettings.audioDeviceId = payload.deviceId;
        lobby.audioTrackPublication?.stop();
        lobby.audioTrackPublication = undefined;
        if (payload.track instanceof LocalAudioTrack) {
          lobby.audioTrackPublication = payload.track;
        }
      }
      if (payload.kind === 'videoinput') {
        state.mediaSettings.videoDeviceId = payload.deviceId;
        lobby.videoTrackPublication?.stop();
        lobby.videoTrackPublication = undefined;
        if (payload.track instanceof LocalVideoTrack) {
          lobby.videoTrackPublication = payload.track;
        }
      }
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
} = livekitSlice.actions;

export const setLivekitUnavailable = createAction<boolean>('livekit/set_livekit_unavailable');
export const startBroadcastRoom = createAction<{ accessToken?: string; participantId?: ParticipantId }>(
  'livekit/start_broadcast_room'
);
export const cleanLocalTracks = createAction('livekit/clean_local_tracks');

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
      action.payload.participantId && listenerApi.dispatch(setVisibleParticipantIds([action.payload.participantId]));
    },
  });
};

const startDisconnectLivekitListeners = (startAppListening: StartAppListening) => {
  startAppListening({
    actionCreator: disconnectRoom.fulfilled,
    effect: async (action, listenerApi) => {
      const { isWhisperRoom } = action.payload;
      const room = isWhisperRoom ? listenerApi.getState().livekit.whisperRoom : listenerApi.getState().livekit.room;
      detachRoomListeners(listenerApi.dispatch, listenerApi.getState, room);
      listenerApi.dispatch(setLivekitRoom({ room: undefined, isWhisperRoom }));
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
    type: 'livekit/triggerReconnect',
    effect: (_, listenerApi: ListenerEffectAPI<RootState, AppDispatch>) => {
      if (!listenerApi.getState().room.isDeleted) {
        reconnect(listenerApi);
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

export const startLivekitListeners = (startAppListening: StartAppListening) => {
  startConnectLivekitListeners(startAppListening);
  startLeaveWhisperGroupListeners(startAppListening);
  startResetSubroomListeners(startAppListening);
  startHangUpListeners(startAppListening);
  startDisconnectLivekitListeners(startAppListening);
  startSubroomAudioDataListeners(startAppListening);
  startJoinSuccessListeners(startAppListening);
  startReconnectOnLivekitTriggerListener(startAppListening);
  startDisableMediaOnCoffeeBreakListener(startAppListening);
  startMediaChoiceListener(startAppListening);
  startDisableMediaOnWaitingRoomListener(startAppListening);
  startBroadcastRoomListeners(startAppListening);
};

const BASE_RETRY_DELAY = 500;
const MAX_RETRY_DELAY = 20000;
const RECONNECT_INDICATOR_THRESHOLD = 0;

const reconnect = (listenerApi: ListenerEffectAPI<RootState, AppDispatch>) => {
  let attempt = 0;
  const calculateDelay = (attempt: number) => Math.min(BASE_RETRY_DELAY * 2 ** attempt, MAX_RETRY_DELAY);

  const tryReconnect = async () => {
    const room = selectLivekitRoom(listenerApi.getState());
    while (room?.state === 'disconnected') {
      if (attempt === RECONNECT_INDICATOR_THRESHOLD) {
        listenerApi.dispatch(setLivekitUnavailable(true));
      }
      if (attempt > RECONNECT_INDICATOR_THRESHOLD) {
        listenerApi.dispatch(createNewAccessToken.action());
      }

      attempt++;
      const delay = calculateDelay(attempt);

      log.debug(`Trying to reconnect to LiveKit room, attempt ${attempt}, delay ${delay}`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    listenerApi.dispatch(setLivekitUnavailable(false));
  };

  tryReconnect().catch((error) => {
    log.error('Failed to reconnect to LiveKit:', error);
  });
};

/************************************************/
/*                                              */
/*             Livekit room listeners           */
/*                                              */
/************************************************/

const attachRoomListeners = (dispatch: AppDispatch, getState: () => RootState, room: Room) => {
  room
    .on(RoomEvent.Connected, () => {
      handleRoomConnected(room, dispatch, getState);
      handleParticipantConnected(getState);
    })
    .on(RoomEvent.Disconnected, () => handleRoomDisconnected(dispatch, getState))
    .on(RoomEvent.TrackPublished, (pub, participant) => handleTrackPublished(pub, participant, dispatch, getState))
    .on(RoomEvent.TrackUnpublished, (pub, participant) => handleTrackUnpublished(pub, participant, dispatch, getState))
    .on(RoomEvent.TrackSubscribed, (_, pub, participant) => handleTrackSubscribed(_, pub, participant))
    .on(RoomEvent.ParticipantPermissionsChanged, (previousPermissions, participant) =>
      handlePermissionChanged(previousPermissions, participant, dispatch)
    )
    .on(RoomEvent.ConnectionStateChanged, () => handleConnectionStateChanged(dispatch, getState))
    .on(RoomEvent.EncryptionError, (error) => handleEncryptionError(error))
    .on(RoomEvent.ParticipantConnected, (participant) => handleParticipantConnected(getState, participant));
};
const detachRoomListeners = (dispatch: AppDispatch, getState: () => RootState, room?: Room) => {
  room
    ?.off(RoomEvent.Connected, () => {
      handleRoomConnected(room, dispatch, getState);
      handleParticipantConnected(getState);
    })
    .off(RoomEvent.Disconnected, () => handleRoomDisconnected(dispatch, getState))
    .off(RoomEvent.TrackPublished, (pub, participant) => handleTrackPublished(pub, participant, dispatch, getState))
    .off(RoomEvent.TrackUnpublished, (pub, participant) => handleTrackUnpublished(pub, participant, dispatch, getState))
    .off(RoomEvent.TrackSubscribed, (_, pub, participant) => handleTrackSubscribed(_, pub, participant))
    .off(RoomEvent.ParticipantPermissionsChanged, (previousPermissions, participant) =>
      handlePermissionChanged(previousPermissions, participant, dispatch)
    )
    .off(RoomEvent.ConnectionStateChanged, () => handleConnectionStateChanged(dispatch, getState))
    .off(RoomEvent.EncryptionError, (error) => handleEncryptionError(error))
    .off(RoomEvent.ParticipantConnected, (participant) => handleParticipantConnected(getState, participant));
};

const handleRoomConnected = async (room: Room, dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setLivekitUnavailable(false));
  const state = getState();
  const { audioDeviceId, videoDeviceId } = state.livekit.mediaSettings;
  const isLobbyCameraEnabled = selectLobbyVideoEnabled(state);
  const isLobbyMicrophoneEnabled = selectLobbyAudioEnabled(state);

  if (room?.state === LivekitConnectionState.Connected) {
    if (isLobbyCameraEnabled) {
      dispatch(changeMedia({ kind: 'videoinput', enabled: isLobbyCameraEnabled, deviceId: videoDeviceId }));
    }
    if (isLobbyMicrophoneEnabled) {
      dispatch(changeMedia({ kind: 'audioinput', enabled: isLobbyMicrophoneEnabled, deviceId: audioDeviceId }));
    }

    // Unsubscribe hidden participant video tracks after initial render
    const remoteParticipants = Array.from(room.remoteParticipants.values());
    const visibleParticipantIds = selectVisibleParticipantIds(state);
    remoteParticipants.forEach((participant) => {
      if (!visibleParticipantIds.includes(participant.identity as ParticipantId)) {
        participant.videoTrackPublications?.forEach((publication) => {
          publication.setSubscribed(false);
        });
      }
    });
    dispatch(cleanLocalTracks());
  }
};

const handleRoomDisconnected = (dispatch: AppDispatch, getState: () => RootState) => {
  const connectionState = getState().room.connectionState;
  if (connectionState === ConnectionState.Online) {
    dispatch({ type: 'livekit/triggerReconnect' });
  }
};

const handleEncryptionError = (error: Error) => {
  if (error instanceof DeviceUnsupportedError) {
    notifications.error(t('unsupported-browser-e2e-encryption-dialog-message'));
  }
};

const handleTrackPublished = (
  pub: RemoteTrackPublication,
  participant: RemoteParticipant,
  dispatch: AppDispatch,
  getState: () => RootState
) => {
  if (pub.source === Track.Source.ScreenShare) {
    dispatch(pinnedRemoteScreenshare(participant.identity as ParticipantId));
    dispatch(updatedCinemaLayout({ layout: LayoutOptions.Speaker }));
  }

  // Unsubscribe hidden participant video tracks after initial publish
  const visibleParticipantIds = selectVisibleParticipantIds(getState());
  if (!visibleParticipantIds.includes(participant.identity as ParticipantId) && pub.kind === Track.Kind.Video) {
    pub.setSubscribed(false);
  }
};

const handleTrackUnpublished = (
  pub: RemoteTrackPublication,
  participant: RemoteParticipant,
  dispatch: AppDispatch,
  getState: () => RootState
) => {
  const pinnedParticipantId = getState().ui.pinnedParticipantId;
  if (pub.source === Track.Source.ScreenShare && participant.identity === pinnedParticipantId) {
    const lastCinemaLayout = getState().ui.cinemaLayout;
    dispatch(pinnedParticipantIdSet(undefined));
    dispatch(updatedCinemaLayout({ layout: lastCinemaLayout }));
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
