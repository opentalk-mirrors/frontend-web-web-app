// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ParticipantPermission } from '@livekit/protocol';
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
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { batch } from 'react-redux';

import { useAppDispatch, useAppSelector } from '.';
import { notifications } from '../commonComponents';
import { LIVEKIT_SCREEN_SHARE_PERMISSION_NUMBER } from '../constants';
import { selectLivekitUnavailable, setLivekitUnavailable } from '../store/slices/livekitSlice';
import {
  selectAudioDeviceId,
  selectAudioEnabled,
  selectVideoDeviceId,
  selectVideoEnabled,
  startMedia,
} from '../store/slices/mediaSlice';
import { ConnectionState, selectRoomConnectionState } from '../store/slices/roomSlice';
import { pinnedParticipantIdSet, pinnedRemoteScreenshare, selectPinnedParticipantId } from '../store/slices/uiSlice';
import { ParticipantId } from '../types';

const useLivekitEvents = (room: Room, isWhisperRoom?: boolean) => {
  const { t } = useTranslation();
  const audioEnabled = useAppSelector(selectAudioEnabled);
  const videoEnabled = useAppSelector(selectVideoEnabled);
  const videoDeviceId = useAppSelector(selectVideoDeviceId);
  const audioDeviceId = useAppSelector(selectAudioDeviceId);
  const connectionState = useAppSelector(selectRoomConnectionState);
  const pinnedParticipantId = useAppSelector(selectPinnedParticipantId);
  const isLivekitUnavailable = useAppSelector(selectLivekitUnavailable);
  const dispatch = useAppDispatch();

  const handleTrackPublished = useCallback(
    (pub: RemoteTrackPublication, participant: RemoteParticipant) => {
      if (pub.source === Track.Source.ScreenShare) {
        dispatch(pinnedRemoteScreenshare(participant.identity as ParticipantId));
      }
    },
    [dispatch]
  );

  const handleTrackUnpublished = useCallback(
    (pub: RemoteTrackPublication, participant: RemoteParticipant) => {
      if (pub.source === Track.Source.ScreenShare && participant.identity === pinnedParticipantId) {
        dispatch(pinnedParticipantIdSet(undefined));
      }
    },
    [dispatch, pinnedParticipantId]
  );

  const localParticipant = room.localParticipant;

  const handlePermissionChanged = useCallback(
    async (
      previousPermissions: ParticipantPermission | undefined,
      participant: RemoteParticipant | LocalParticipant
    ) => {
      if (!participant.isLocal) return;

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
          dispatch(startMedia({ kind: 'screenshare', enabled: false }));
          notifications.close('control-participant-presenter-role-granted');
          notifications.warning(t('control-participant-presenter-role-revoked'), {
            key: 'control-participant-presenter-role-revoked',
          });
        }
      }
    },
    [t, localParticipant.setScreenShareEnabled]
  );

  // Listener to maintain camera and microphone state between room transitions (layout-meetingView, meetingView-breakoutrooms)
  const handleRoomConnected = useCallback(async () => {
    dispatch(setLivekitUnavailable(false));
    if (room?.state === LivekitConnectionState.Connected) {
      batch(() => {
        if (videoEnabled !== localParticipant.isCameraEnabled) {
          dispatch(startMedia({ kind: 'videoinput', enabled: videoEnabled, deviceId: videoDeviceId }));
        }
        if (audioEnabled !== localParticipant.isMicrophoneEnabled) {
          dispatch(startMedia({ kind: 'audioinput', enabled: audioEnabled, deviceId: audioDeviceId }));
        }
      });
    }
  }, [
    localParticipant.isCameraEnabled,
    localParticipant.isMicrophoneEnabled,
    room?.state,
    videoDeviceId,
    audioDeviceId,
    videoEnabled,
    audioEnabled,
    dispatch,
    startMedia,
  ]);

  const handleTrackSubscribed = useCallback(
    (_: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
      if (publication.isEncrypted) {
        console.debug(`subscribed encrypted ${publication.kind} stream from user with ID:`, participant.identity);
      }
    },
    []
  );

  useEffect(() => {
    sessionStorage.removeItem('isPageReloading');

    window.onbeforeunload = () => {
      sessionStorage.setItem('isPageReloading', 'true');
    };

    return () => {
      window.onbeforeunload = null;
    };
  }, []);

  const handleRoomDisconnected = useCallback(() => {
    const isPageReloading = sessionStorage.getItem('isPageReloading') === 'true';

    if (connectionState !== ConnectionState.Leaving && !isWhisperRoom && !isPageReloading) {
      dispatch({ type: 'livekit/triggerReconnect' });
    }
  }, [dispatch, connectionState, isWhisperRoom]);

  const handleConnectionStateChanged = useCallback(
    (state: LivekitConnectionState) => {
      if (state === LivekitConnectionState.SignalReconnecting && !isWhisperRoom) {
        dispatch(setLivekitUnavailable(true));
      } else if (state === LivekitConnectionState.Connected && isLivekitUnavailable) {
        dispatch(setLivekitUnavailable(false));
      }
    },
    [dispatch, isWhisperRoom, isLivekitUnavailable]
  );

  // Handle unexpected LiveKit disconnection after joining a meeting
  useEffect(() => {
    if (
      room.state === LivekitConnectionState.Disconnected &&
      !isWhisperRoom &&
      connectionState !== ConnectionState.Leaving
    ) {
      // Add a delay to prevent unnecessary reconnect attempts during normal delayed joins
      const timer = setTimeout(() => {
        if (room.state === LivekitConnectionState.Disconnected) {
          dispatch({ type: 'livekit/triggerReconnect' });
        }
      }, 1000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [room.state, isWhisperRoom, dispatch, connectionState]);

  useEffect(() => {
    room
      .on(RoomEvent.Connected, handleRoomConnected)
      .on(RoomEvent.Disconnected, handleRoomDisconnected)
      .on(RoomEvent.TrackPublished, handleTrackPublished)
      .on(RoomEvent.TrackUnpublished, handleTrackUnpublished)
      .on(RoomEvent.TrackSubscribed, handleTrackSubscribed)
      .on(RoomEvent.ParticipantPermissionsChanged, handlePermissionChanged)
      .on(RoomEvent.ConnectionStateChanged, handleConnectionStateChanged);

    return () => {
      room
        .off(RoomEvent.Connected, handleRoomConnected)
        .off(RoomEvent.Disconnected, handleRoomDisconnected)
        .off(RoomEvent.TrackPublished, handleTrackPublished)
        .off(RoomEvent.TrackUnpublished, handleTrackUnpublished)
        .off(RoomEvent.TrackSubscribed, handleTrackSubscribed)
        .off(RoomEvent.ParticipantPermissionsChanged, handlePermissionChanged)
        .off(RoomEvent.ConnectionStateChanged, handleConnectionStateChanged);
    };
  }, [
    room.on,
    room.off,
    localParticipant.on,
    localParticipant.off,
    handleConnectionStateChanged,
    handlePermissionChanged,
    handleRoomConnected,
    handleRoomDisconnected,
    handleTrackPublished,
    handleTrackSubscribed,
    handleTrackUnpublished,
  ]);
};

export default useLivekitEvents;
