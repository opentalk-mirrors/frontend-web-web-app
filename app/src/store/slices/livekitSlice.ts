// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
// Redux has limitations with non-serializable data, like the LiveKit room object, as it can cause issues with state persistence.
// We've decided to use a separate slice and declare an exception in the store for now.
import { ParticipantPermission } from '@livekit/protocol';
import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit';
import { isAnyOf, ListenerEffectAPI } from '@reduxjs/toolkit';
import { t } from 'i18next';
import {
  ConnectionState as LivekitConnectionState,
  LocalParticipant,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  Room,
  RoomEvent,
  Track,
} from 'livekit-client';

import { Credentials } from '../../api/types/incoming/livekit';
import { createNewAccessToken } from '../../api/types/outgoing/livekit';
import { notifications } from '../../commonComponents';
import { LIVEKIT_SCREEN_SHARE_PERMISSION_NUMBER } from '../../constants';
import log from '../../logger';
import { MediaDescriptor } from '../../modules/WebRTC';
import { ConnectionState } from '../../modules/WebRTC/ConferenceRoom';
import { VideoSetting } from '../../types';
import type { ParticipantId } from '../../types';
import { hangUp, joinSuccess, startMedia } from '../commonActions';
import type { RootState, AppDispatch } from '../index';
import type { StartAppListening } from '../listenerMiddleware';
import { setLivekitUnavailable, setLivekitAvailable, getLivekitRoom } from '../livekitRoom';
import { pinnedRemoteScreenshare, pinnedParticipantIdSet } from './uiSlice';

type PopoutStreamAccess = {
  mediaDescriptor: MediaDescriptor;
  token: string | undefined;
};

type PopoutStreamAccesses = Array<PopoutStreamAccess>;

export type LivekitState = {
  unavailable: boolean;
  accessToken: string | undefined;
  publicUrl: string | undefined;
  popoutStreamAccesses: PopoutStreamAccesses;
  qualityCap: VideoSetting;
};

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
        log.warn('cant find popoutStreamAccess to add token');
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

/************************************************/
/*                                              */
/*                  Listeners                   */
/*                                              */
/************************************************/

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

      log.debug(`Trying to reconnect to LiveKit room, attempt ${attempt}, delay ${delay}`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    listenerApi.dispatch(setLivekitUnavailable(false));
  };

  tryReconnect().catch((error) => {
    log.error('Failed to reconnect to LiveKit:', error);
  });
};

const handleRoomConnected = async (room: Room, listenerApi: ListenerEffectAPI<RootState, AppDispatch>) => {
  listenerApi.dispatch(setLivekitUnavailable(false));
  const { videoEnabled, audioEnabled, videoDeviceId, audioDeviceId } = listenerApi.getState().media;
  if (room?.state === LivekitConnectionState.Connected) {
    if (videoEnabled !== room.localParticipant.isCameraEnabled) {
      listenerApi.dispatch(startMedia({ kind: 'videoinput', enabled: videoEnabled, deviceId: videoDeviceId }));
    }
    if (audioEnabled !== room.localParticipant.isMicrophoneEnabled) {
      listenerApi.dispatch(startMedia({ kind: 'audioinput', enabled: audioEnabled, deviceId: audioDeviceId }));
    }
  }
};

const handleRoomDisconnected = (listenerApi: ListenerEffectAPI<RootState, AppDispatch>) => {
  const connectionState = listenerApi.getState().room.connectionState;

  if (
    connectionState !== ConnectionState.Leaving &&
    [ConnectionState.ReadyToEnter, ConnectionState.Waiting, ConnectionState.Online].includes(connectionState)
  ) {
    listenerApi.dispatch({ type: 'livekit/triggerReconnect' });
  }
};

const handleTrackPublished = (
  pub: RemoteTrackPublication,
  participant: RemoteParticipant,
  listenerApi: ListenerEffectAPI<RootState, AppDispatch>
) => {
  if (pub.source === Track.Source.ScreenShare) {
    listenerApi.dispatch(pinnedRemoteScreenshare(participant.identity as ParticipantId));
  }
};

const handleTrackUnpublished = (
  pub: RemoteTrackPublication,
  participant: RemoteParticipant,
  listenerApi: ListenerEffectAPI<RootState, AppDispatch>
) => {
  const pinnedParticipantId = listenerApi.getState().ui.pinnedParticipantId;
  if (pub.source === Track.Source.ScreenShare && participant.identity === pinnedParticipantId) {
    listenerApi.dispatch(pinnedParticipantIdSet(undefined));
  }
};

const handleTrackSubscribed = (_: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
  if (publication.isEncrypted) {
    log.debug(`subscribed encrypted ${publication.kind} stream from user with ID:`, participant.identity);
  }
};

const handlePermissionChanged = (
  previousPermissions: ParticipantPermission | undefined,
  participant: RemoteParticipant | LocalParticipant,
  listenerApi: ListenerEffectAPI<RootState, AppDispatch>
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
      listenerApi.dispatch(startMedia({ kind: 'screenshare', enabled: false }));
      notifications.close('control-participant-presenter-role-granted');
      notifications.warning(t('control-participant-presenter-role-revoked'), {
        key: 'control-participant-presenter-role-revoked',
      });
    }
  }
};

const handleConnectionStateChanged = (
  state: LivekitConnectionState,
  listenerApi: ListenerEffectAPI<RootState, AppDispatch>
) => {
  const isLivekitUnavailable = listenerApi.getState().livekit.unavailable;
  if (state === LivekitConnectionState.SignalReconnecting) {
    listenerApi.dispatch(setLivekitUnavailable(true));
  } else if (state === LivekitConnectionState.Connected && isLivekitUnavailable) {
    listenerApi.dispatch(setLivekitUnavailable(false));
  }
};

const startReconnectOnLivekitTriggerListener = (startAppListening: StartAppListening) =>
  startAppListening({
    type: 'livekit/triggerReconnect',
    effect: (_, listenerApi: ListenerEffectAPI<RootState, AppDispatch>) => {
      if (!listenerApi.getState().room.isDeleted) {
        reconnect(listenerApi);
      }
    },
  });

const startToggleEmitterListener = (startAppListening: StartAppListening) =>
  startAppListening({
    matcher: isAnyOf(setLivekitAvailable, hangUp.fulfilled),
    effect: (action, listenerApi: ListenerEffectAPI<RootState, AppDispatch>) => {
      const room = getLivekitRoom();
      if (setLivekitAvailable.match(action)) {
        room
          .on(RoomEvent.Connected, () => handleRoomConnected(room, listenerApi))
          .on(RoomEvent.Disconnected, () => handleRoomDisconnected(listenerApi))
          .on(RoomEvent.TrackPublished, (pub, participant) => handleTrackPublished(pub, participant, listenerApi))
          .on(RoomEvent.TrackUnpublished, (pub, participant) => handleTrackUnpublished(pub, participant, listenerApi))
          .on(RoomEvent.TrackSubscribed, (_, pub, participant) => handleTrackSubscribed(_, pub, participant))
          .on(RoomEvent.ParticipantPermissionsChanged, (previousPermissions, participant) =>
            handlePermissionChanged(previousPermissions, participant, listenerApi)
          )
          .on(RoomEvent.ConnectionStateChanged, (state) => handleConnectionStateChanged(state, listenerApi));
      } else if (hangUp.fulfilled.match(action)) {
        room
          .off(RoomEvent.Connected, () => handleRoomConnected(room, listenerApi))
          .off(RoomEvent.Disconnected, () => handleRoomDisconnected(listenerApi))
          .off(RoomEvent.TrackPublished, (pub, participant) => handleTrackPublished(pub, participant, listenerApi))
          .off(RoomEvent.TrackUnpublished, (pub, participant) => handleTrackUnpublished(pub, participant, listenerApi))
          .off(RoomEvent.TrackSubscribed, (_, pub, participant) => handleTrackSubscribed(_, pub, participant))
          .off(RoomEvent.ParticipantPermissionsChanged, (previousPermissions, participant) =>
            handlePermissionChanged(previousPermissions, participant, listenerApi)
          )
          .off(RoomEvent.ConnectionStateChanged, (state) => handleConnectionStateChanged(state, listenerApi));
      }
    },
  });

export const startLivekitListeners = (startAppListening: StartAppListening) => {
  startReconnectOnLivekitTriggerListener(startAppListening);
  startToggleEmitterListener(startAppListening);
};
