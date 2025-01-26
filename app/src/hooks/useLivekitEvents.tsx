// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ParticipantPermission } from '@livekit/protocol';
import {
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
import {
  selectAudioEnabled,
  selectVideoEnabled,
  selectAudioDeviceId,
  selectVideoDeviceId,
  setAudioEnabled,
  setVideoEnabled,
} from '../store/slices/mediaSlice';
import { pinnedParticipantIdSet, pinnedRemoteScreenshare, selectPinnedParticipantId } from '../store/slices/uiSlice';
import { updateLastActive } from '../store/slices/userSlice';
import { ParticipantId } from '../types';

const useLivekitEvents = (room: Room, isWhisperRoom?: boolean) => {
  const { t } = useTranslation();
  const audioEnabled = useAppSelector(selectAudioEnabled);
  const videoEnabled = useAppSelector(selectVideoEnabled);
  const videoDeviceId = useAppSelector(selectVideoDeviceId);
  const audioDeviceId = useAppSelector(selectAudioDeviceId);

  const pinnedParticipantId = useAppSelector(selectPinnedParticipantId);
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
    (pub: TrackPublication | LocalTrackPublication, enableAudio: boolean) => {
      dispatch(updateLastActive());

      switch (pub.source) {
        case Track.Source.Camera:
          dispatch(setVideoEnabled(room.localParticipant.isCameraEnabled));
          break;

        case Track.Source.Microphone: {
          if (!isWhisperRoom) {
            let isMicrophoneEnabled = room.localParticipant.isMicrophoneEnabled;
            // Participants are only set at unmute events
            const audioEnabledByUserChoice = audioEnabled || enableAudio;

            // If user explicitly disabled audio, override the participant's microphone state
            if (audioEnabledByUserChoice !== undefined && !audioEnabledByUserChoice) {
              isMicrophoneEnabled = false;
              room.localParticipant.setMicrophoneEnabled(false);
            }
            dispatch(setAudioEnabled(isMicrophoneEnabled));
          }
          break;
        }

        default:
          console.debug(`Unhandled track source: ${pub.source}`);
          break;
      }
    },
    [audioEnabled, isWhisperRoom, room.localParticipant, dispatch]
  );

  const localParticipant = room.localParticipant;

  const handlePermissionChanged = useCallback(
    (previousPermissions: ParticipantPermission | undefined, participant: RemoteParticipant | LocalParticipant) => {
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
          localParticipant.setScreenShareEnabled(false);
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
  const handleRoomConnected = useCallback(() => {
    if (room.engine && !room.engine.isClosed) {
      if (videoEnabled !== localParticipant.isCameraEnabled) {
        localParticipant.setCameraEnabled(true, { deviceId: videoDeviceId });
      }
      if (audioEnabled !== localParticipant.isMicrophoneEnabled) {
        localParticipant.setMicrophoneEnabled(true, { deviceId: audioDeviceId });
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
    const handleUnmuteEventListener = (pub: TrackPublication | LocalTrackPublication) => handleTrackState(pub, true);
    const handleMuteEventListener = (pub: TrackPublication | LocalTrackPublication) => handleTrackState(pub, false);

    room.on(RoomEvent.Connected, handleRoomConnected);
    room.on(RoomEvent.TrackPublished, handleTrackPublished);
    room.on(RoomEvent.TrackUnpublished, handleTrackUnpublished);
    room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
    room.on(RoomEvent.ParticipantPermissionsChanged, handlePermissionChanged);
    localParticipant.on(ParticipantEvent.TrackUnmuted, handleUnmuteEventListener);
    localParticipant.on(ParticipantEvent.LocalTrackPublished, handleUnmuteEventListener);
    localParticipant.on(ParticipantEvent.TrackMuted, handleMuteEventListener);
    localParticipant.on(ParticipantEvent.LocalTrackUnpublished, handleMuteEventListener);

    return () => {
      room.off(RoomEvent.Connected, handleRoomConnected);
      room.off(RoomEvent.TrackPublished, handleTrackPublished);
      room.off(RoomEvent.TrackUnpublished, handleTrackUnpublished);
      room.off(RoomEvent.TrackSubscribed, handleTrackSubscribed);
      room.off(RoomEvent.ParticipantPermissionsChanged, handlePermissionChanged);
      localParticipant.off(ParticipantEvent.TrackUnmuted, handleUnmuteEventListener);
      localParticipant.off(ParticipantEvent.LocalTrackPublished, handleUnmuteEventListener);
      localParticipant.off(ParticipantEvent.TrackMuted, handleMuteEventListener);
      localParticipant.off(ParticipantEvent.LocalTrackUnpublished, handleMuteEventListener);
    };
  }, [
    room.on,
    room.off,
    localParticipant.on,
    localParticipant.off,
    handlePermissionChanged,
    handleRoomConnected,
    handleTrackPublished,
    handleTrackState,
    handleTrackSubscribed,
    handleTrackUnpublished,
  ]);
};

export default useLivekitEvents;
