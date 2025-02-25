// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ParticipantPermission } from '@livekit/protocol';
import {
  ConnectionState as LivekitConnectionState,
  LocalParticipant,
  LocalTrackPublication,
  ParticipantEvent,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  Room,
  RoomEvent,
  Track,
  TrackPublication,
} from 'livekit-client';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '.';
import { notifications } from '../commonComponents';
import { LIVEKIT_SCREEN_SHARE_PERMISSION_NUMBER } from '../constants';
import { selectLivekitUnavailable, setLivekitUnavailable } from '../store/slices/livekitSlice';
import {
  selectAudioDeviceId,
  selectAudioEnabled,
  selectVideoDeviceId,
  selectVideoEnabled,
  setAudioEnabled,
} from '../store/slices/mediaSlice';
import { ConnectionState, selectRoomConnectionState } from '../store/slices/roomSlice';
import { pinnedParticipantIdSet, pinnedRemoteScreenshare, selectPinnedParticipantId } from '../store/slices/uiSlice';
import { updateLastActive } from '../store/slices/userSlice';
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

  const handleTrackState = useCallback(
    async (pub: TrackPublication | LocalTrackPublication, enableAudio: boolean) => {
      dispatch(updateLastActive());

      if (pub.source === Track.Source.Microphone) {
        if (!isWhisperRoom) {
          let isMicrophoneEnabled = room.localParticipant.isMicrophoneEnabled;
          // Participants are only set at unmute events
          const audioEnabledByUserChoice = audioEnabled || enableAudio;

          // If user explicitly disabled audio, override the participant's microphone state
          if (audioEnabledByUserChoice !== undefined && !audioEnabledByUserChoice) {
            isMicrophoneEnabled = false;
            await room.localParticipant.setMicrophoneEnabled(false);
          }
          dispatch(setAudioEnabled(isMicrophoneEnabled));
        }
      }
    },
    [audioEnabled, isWhisperRoom, room.localParticipant, dispatch]
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
          await localParticipant.setScreenShareEnabled(false);
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
    if (room.engine && !room.engine.isClosed) {
      if (videoEnabled !== localParticipant.isCameraEnabled) {
        await localParticipant.setCameraEnabled(true, { deviceId: videoDeviceId }).catch((error) => {
          console.error('Unable to start video: ', error);
        });
      }
      if (audioEnabled !== localParticipant.isMicrophoneEnabled) {
        await localParticipant.setMicrophoneEnabled(true, { deviceId: audioDeviceId }).catch((error) => {
          console.error('Unable to start audio: ', error);
        });
      }
    }
  }, [
    localParticipant.isCameraEnabled,
    localParticipant.isMicrophoneEnabled,
    localParticipant.setCameraEnabled,
    localParticipant.setMicrophoneEnabled,
    room.engine,
    videoDeviceId,
    audioDeviceId,
    videoEnabled,
    audioEnabled,
    dispatch,
  ]);

  const handleTrackSubscribed = useCallback(
    (_: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
      if (publication.isEncrypted) {
        console.debug(`subscribed encrypted ${publication.kind} stream from user with ID:`, participant.identity);
      }
    },
    []
  );

  const handleRoomDisconnected = useCallback(() => {
    if (connectionState !== ConnectionState.Leaving && !isWhisperRoom) {
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
    const handleUnmuteEventListener = (pub: TrackPublication | LocalTrackPublication) => handleTrackState(pub, true);
    const handleMuteEventListener = (pub: TrackPublication | LocalTrackPublication) => handleTrackState(pub, false);

    room
      .on(RoomEvent.Connected, handleRoomConnected)
      .on(RoomEvent.Disconnected, handleRoomDisconnected)
      .on(RoomEvent.TrackPublished, handleTrackPublished)
      .on(RoomEvent.TrackUnpublished, handleTrackUnpublished)
      .on(RoomEvent.TrackSubscribed, handleTrackSubscribed)
      .on(RoomEvent.ParticipantPermissionsChanged, handlePermissionChanged)
      .on(RoomEvent.ConnectionStateChanged, handleConnectionStateChanged);
    localParticipant
      .on(ParticipantEvent.TrackUnmuted, handleUnmuteEventListener)
      .on(ParticipantEvent.LocalTrackPublished, handleUnmuteEventListener)
      .on(ParticipantEvent.TrackMuted, handleMuteEventListener)
      .on(ParticipantEvent.LocalTrackUnpublished, handleMuteEventListener);

    return () => {
      room
        .off(RoomEvent.Connected, handleRoomConnected)
        .off(RoomEvent.Disconnected, handleRoomDisconnected)
        .off(RoomEvent.TrackPublished, handleTrackPublished)
        .off(RoomEvent.TrackUnpublished, handleTrackUnpublished)
        .off(RoomEvent.TrackSubscribed, handleTrackSubscribed)
        .off(RoomEvent.ParticipantPermissionsChanged, handlePermissionChanged)
        .off(RoomEvent.ConnectionStateChanged, handleConnectionStateChanged);
      localParticipant
        .off(ParticipantEvent.TrackUnmuted, handleUnmuteEventListener)
        .off(ParticipantEvent.LocalTrackPublished, handleUnmuteEventListener)
        .off(ParticipantEvent.TrackMuted, handleMuteEventListener)
        .off(ParticipantEvent.LocalTrackUnpublished, handleMuteEventListener);
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
    handleTrackState,
    handleTrackSubscribed,
    handleTrackUnpublished,
  ]);
};

export default useLivekitEvents;
