// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
// Redux has limitations with non-serializable data, like the LiveKit room object, as it can cause issues with state persistence.
// We've decided to use a separate slice and declare an exception in the store for now.
import { ParticipantPermission } from '@livekit/protocol';
import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit';
import { ListenerEffectAPI, isAnyOf } from '@reduxjs/toolkit';
import { t } from 'i18next';
import {
  ConnectionQuality,
  ConnectionState as LivekitConnectionState,
  LocalParticipant,
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
import { notifications } from '../../commonComponents';
import { LIVEKIT_SCREEN_SHARE_PERMISSION_NUMBER } from '../../constants';
import LayoutOptions from '../../enums/LayoutOptions';
import log from '../../logger';
import { MediaDescriptor } from '../../modules/WebRTC';
import { ConnectionState } from '../../modules/WebRTC/ConferenceRoom';
import { VideoSetting } from '../../types';
import type { ParticipantId } from '../../types';
import { hangUp, joinSuccess, startMedia } from '../commonActions';
import type { AppDispatch, RootState } from '../index';
import type { StartAppListening } from '../listenerMiddleware';
import { getLivekitRoom, setLivekitAvailable, setLivekitUnavailable } from '../livekitRoom';
import { setAudioDeviceId, setVideoDeviceId } from './mediaSlice';
import { selectAllOnlineParticipantsInConference, selectParticipantName } from './participantsSlice';
import {
  pinnedParticipantIdSet,
  pinnedRemoteScreenshare,
  selectVisibleParticipantIds,
  updatedCinemaLayout,
} from './uiSlice';

type PopoutStreamAccess = {
  mediaDescriptor: MediaDescriptor;
  token: string | undefined;
};

type PopoutStreamAccesses = Array<PopoutStreamAccess>;

const EAVESDROP_CHECK_TIMEOUT = 5000;

export type LivekitState = {
  unavailable: boolean;
  accessToken: string | undefined;
  publicUrl: string | undefined;
  popoutStreamAccesses: PopoutStreamAccesses;
  qualityCap: VideoSetting;
  popoutParticipantId: string | undefined;
};

const initialState: LivekitState = {
  unavailable: false,
  accessToken: undefined,
  publicUrl: undefined,
  popoutStreamAccesses: [],
  qualityCap: VideoSetting.High,
  popoutParticipantId: undefined,
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
    setPopoutParticipantId: (state, { payload }: PayloadAction<string | undefined>) => {
      state.popoutParticipantId = payload;
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
  setPopoutParticipantId,
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
export const selectPopoutParticipantId = (state: RootState) => state.livekit.popoutParticipantId;

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
  const state = listenerApi.getState();
  const { videoEnabled, audioEnabled, videoDeviceId, audioDeviceId } = state.media;
  if (room?.state === LivekitConnectionState.Connected) {
    if (videoEnabled !== room.localParticipant.isCameraEnabled) {
      listenerApi.dispatch(startMedia({ kind: 'videoinput', enabled: videoEnabled, deviceId: videoDeviceId }));
    }
    if (audioEnabled !== room.localParticipant.isMicrophoneEnabled) {
      listenerApi.dispatch(startMedia({ kind: 'audioinput', enabled: audioEnabled, deviceId: audioDeviceId }));
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
    listenerApi.dispatch(updatedCinemaLayout({ layout: LayoutOptions.Speaker, cacheLastLayout: true }));
  }

  // Unsubscribe hidden participant video tracks after initial publish
  const state = listenerApi.getState();
  const visibleParticipantIds = selectVisibleParticipantIds(state);
  if (!visibleParticipantIds.includes(participant.identity as ParticipantId) && pub.kind === Track.Kind.Video) {
    pub.setSubscribed(false);
  }
};

const handleTrackUnpublished = (
  pub: RemoteTrackPublication,
  participant: RemoteParticipant,
  listenerApi: ListenerEffectAPI<RootState, AppDispatch>
) => {
  const pinnedParticipantId = listenerApi.getState().ui.pinnedParticipantId;
  if (pub.source === Track.Source.ScreenShare && participant.identity === pinnedParticipantId) {
    const lastCinemaLayout = listenerApi.getState().ui.lastCinemaLayout;
    listenerApi.dispatch(pinnedParticipantIdSet(undefined));
    if (lastCinemaLayout !== undefined) {
      listenerApi.dispatch(updatedCinemaLayout({ layout: lastCinemaLayout }));
    }
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

const deviceChangeOnLivekitTriggerListener = (startAppListening: StartAppListening) =>
  startAppListening({
    matcher: isAnyOf(setVideoDeviceId, setAudioDeviceId),
    effect: (action) => {
      const room = getLivekitRoom();
      if (room) {
        if (setVideoDeviceId.match(action) && action.payload) {
          room.switchActiveDevice('videoinput', action.payload);
        }
        if (setAudioDeviceId.match(action) && action.payload) {
          room.switchActiveDevice('audioinput', action.payload);
        }
      }
    },
  });

const handleParticipantConnected = (
  listenerApi: ListenerEffectAPI<RootState, AppDispatch>,
  remoteParticipant?: Participant
) => {
  setTimeout(() => {
    const disconnectedStates = [ConnectionQuality.Lost, ConnectionQuality.Unknown];
    const state = listenerApi.getState();
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

    const remoteParticipants = Array.from(getLivekitRoom().remoteParticipants.values());
    const unauthorizedParticipantNames = remoteParticipants
      .filter(isActiveAndUnauthorized)
      .filter((p) => p.identity !== selectPopoutParticipantId(state))
      .map((p) => selectParticipantName(state, p.identity as ParticipantId) || p.identity);

    if (unauthorizedParticipantNames.length > 0) {
      notifications.error(t('security-breach-eavesdrop', { participants: unauthorizedParticipantNames.join(', ') }));
    }
  }, EAVESDROP_CHECK_TIMEOUT);
};

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
          .on(RoomEvent.ConnectionStateChanged, (state) => handleConnectionStateChanged(state, listenerApi))
          .on(RoomEvent.ParticipantConnected, (participant) => handleParticipantConnected(listenerApi, participant))
          .on(RoomEvent.Connected, () => handleParticipantConnected(listenerApi));
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
          .off(RoomEvent.ConnectionStateChanged, (state) => handleConnectionStateChanged(state, listenerApi))
          .off(RoomEvent.ParticipantConnected, (participant) => handleParticipantConnected(listenerApi, participant))
          .off(RoomEvent.Connected, () => handleParticipantConnected(listenerApi));
      }
    },
  });

const startReconnectOnLivekitTriggerListener = (startAppListening: StartAppListening) =>
  startAppListening({
    type: 'livekit/triggerReconnect',
    effect: (_, listenerApi: ListenerEffectAPI<RootState, AppDispatch>) => {
      if (!listenerApi.getState().room.isDeleted) {
        reconnect(listenerApi);
      }
    },
  });

export const startLivekitListeners = (startAppListening: StartAppListening) => {
  startReconnectOnLivekitTriggerListener(startAppListening);
  startToggleEmitterListener(startAppListening);
  deviceChangeOnLivekitTriggerListener(startAppListening);
};
