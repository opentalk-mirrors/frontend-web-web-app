// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ParticipantPermission } from '@livekit/protocol';
import {
  LocalParticipant,
  LocalTrackPublication,
  Participant,
  ParticipantEvent,
  RemoteParticipant,
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
import { useMediaChoices } from '../provider/MediaChoicesProvider';
import { pinnedParticipantIdSet, pinnedRemoteScreenshare, selectPinnedParticipantId } from '../store/slices/uiSlice';
import { updateLastActive } from '../store/slices/userSlice';
import { ParticipantId } from '../types';

const useLivekitEvents = (room: Room, isWhisperRoom?: boolean) => {
  const { t } = useTranslation();
  const mediaChoices = useMediaChoices();

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

  const handleTrackMuteState = useCallback(
    (pub: TrackPublication | LocalTrackPublication, participant: Participant | LocalParticipant) => {
      if (participant.isLocal) {
        switch (pub.source) {
          case Track.Source.Camera:
            mediaChoices?.saveVideoInputEnabled(participant.isCameraEnabled);
            break;
          case Track.Source.Microphone:
            !isWhisperRoom && mediaChoices?.saveAudioInputEnabled(participant.isMicrophoneEnabled);
            break;
          default:
            break;
        }
      }
    },
    [mediaChoices, isWhisperRoom]
  );

  const handleUpdateLastActive = useCallback(() => {
    dispatch(updateLastActive());
  }, [dispatch]);

  const localParticipant = room.localParticipant;
  const localParticipantPermissions = room.localParticipant.permissions;

  const handlePermissionChanged = useCallback(
    (previousPermissions: ParticipantPermission | undefined) => {
      if (previousPermissions) {
        const changed = localParticipantPermissions?.canPublishSources.filter(
          (item) => previousPermissions.canPublishSources.indexOf(item) < 0
        );

        const hadScreenShare = previousPermissions.canPublishSources.includes(LIVEKIT_SCREEN_SHARE_PERMISSION_NUMBER);
        const hasScreenShare =
          localParticipantPermissions?.canPublishSources.includes(LIVEKIT_SCREEN_SHARE_PERMISSION_NUMBER) || false;

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
    [t, localParticipant.setScreenShareEnabled, localParticipantPermissions]
  );

  // Listener to maintain camera and microphone state between room transitions (layout-meetingView, meetingView-breakoutrooms)
  const handleRoomConnected = useCallback(() => {
    if (room.engine && !room.engine.isClosed) {
      if (mediaChoices?.userChoices.videoEnabled !== localParticipant.isCameraEnabled) {
        localParticipant.setCameraEnabled(true, { deviceId: mediaChoices?.userChoices.videoDeviceId });
      }
      if (mediaChoices?.userChoices.audioEnabled !== localParticipant.isMicrophoneEnabled) {
        localParticipant.setMicrophoneEnabled(true, { deviceId: mediaChoices?.userChoices.audioDeviceId });
      }
    }
  }, [
    localParticipant.isCameraEnabled,
    mediaChoices?.userChoices,
    localParticipant.isMicrophoneEnabled,
    localParticipant.setCameraEnabled,
    localParticipant.setMicrophoneEnabled,
    room.engine,
  ]);

  useEffect(() => {
    room.on(RoomEvent.Connected, handleRoomConnected);
    room.on(RoomEvent.TrackPublished, handleTrackPublished);
    room.on(RoomEvent.TrackUnpublished, handleTrackUnpublished);
    room.on(RoomEvent.LocalTrackPublished, handleTrackMuteState);
    room.on(RoomEvent.TrackMuted, handleTrackMuteState);
    room.on(RoomEvent.TrackUnmuted, handleTrackMuteState);
    localParticipant?.on(ParticipantEvent.TrackMuted, handleUpdateLastActive);
    localParticipant?.on(ParticipantEvent.TrackUnmuted, handleUpdateLastActive);
    localParticipant?.on(ParticipantEvent.LocalTrackPublished, handleUpdateLastActive);
    localParticipant?.on(ParticipantEvent.LocalTrackUnpublished, handleUpdateLastActive);
    localParticipant?.on(ParticipantEvent.ParticipantPermissionsChanged, handlePermissionChanged);

    return () => {
      room.off(RoomEvent.Connected, handleRoomConnected);
      room.off(RoomEvent.TrackPublished, handleTrackPublished);
      room.off(RoomEvent.TrackUnpublished, handleTrackUnpublished);
      room.off(RoomEvent.LocalTrackPublished, handleTrackMuteState);
      room.off(RoomEvent.TrackMuted, handleTrackMuteState);
      room.off(RoomEvent.TrackUnmuted, handleTrackMuteState);
      localParticipant?.off(ParticipantEvent.TrackMuted, handleUpdateLastActive);
      localParticipant?.off(ParticipantEvent.TrackUnmuted, handleUpdateLastActive);
      localParticipant?.off(ParticipantEvent.LocalTrackPublished, handleUpdateLastActive);
      localParticipant?.off(ParticipantEvent.LocalTrackUnpublished, handleUpdateLastActive);
      localParticipant?.off(ParticipantEvent.ParticipantPermissionsChanged, handlePermissionChanged);
    };
  }, [
    room.on,
    room.off,
    localParticipant.on,
    localParticipant.off,
    handleTrackMuteState,
    handleTrackPublished,
    handleTrackUnpublished,
    handleUpdateLastActive,
    handlePermissionChanged,
    handleRoomConnected,
  ]);
};

export default useLivekitEvents;
