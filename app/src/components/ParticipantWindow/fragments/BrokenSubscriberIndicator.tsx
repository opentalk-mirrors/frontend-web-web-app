// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useRemoteParticipant } from '@livekit/components-react';
import { ParticipantEvent, Track } from 'livekit-client';
import { VideoHTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';

import { CameraOnIcon, ConnectionGoodIcon, MicOnIcon } from '../../../assets/icons';
import { useAppSelector } from '../../../hooks';
import { MediaDescriptor } from '../../../modules/WebRTC';
import { selectQualityCap } from '../../../store/slices/livekitSlice';
import { VideoSetting } from '../../../types';
import { FailureBadge } from './FailureBadge';

type IRemoteVideoProps = VideoHTMLAttributes<HTMLVideoElement> & {
  descriptor: MediaDescriptor;
};

const BrokenSubscriberIndicator = ({ descriptor }: IRemoteVideoProps) => {
  const participant = useRemoteParticipant(descriptor.connectionIdentifier, {
    updateOnlyOn: [
      ParticipantEvent.TrackMuted,
      ParticipantEvent.TrackUnmuted,
      ParticipantEvent.TrackSubscribed,
      ParticipantEvent.TrackUnsubscribed,
      ParticipantEvent.ConnectionQualityChanged,
    ],
  });

  const isParticipantDisconnected = participant?.signalClient?.isDisconnected;
  const { t } = useTranslation();
  const qualityCap = useAppSelector(selectQualityCap);

  const hasVideo = participant?.isCameraEnabled && participant.videoTrackPublications.size !== 0;
  const expectVideo =
    hasVideo && (descriptor.mediaType === Track.Source.ScreenShare || qualityCap !== VideoSetting.Off);

  if (participant === undefined || !(participant.isMicrophoneEnabled || expectVideo)) {
    return null;
  }

  if (isParticipantDisconnected === undefined || isParticipantDisconnected) {
    return (
      <FailureBadge title={t('participant-stream-broken-tooltip') || ''}>
        <ConnectionGoodIcon color="error" fontSize="medium" />
      </FailureBadge>
    );
  }

  const audioBroken = participant.isMicrophoneEnabled && participant.audioTrackPublications.size === 0;
  const videoBroken = expectVideo && participant.videoTrackPublications.size === 0;

  if (!audioBroken && !videoBroken) {
    return null;
  }
  let errorText = '';

  if (audioBroken && videoBroken) {
    errorText = t('participant-stream-broken-tooltip');
  } else if (audioBroken) {
    errorText = t('participant-audio-broken-tooltip');
  } else if (videoBroken) {
    errorText = t('participant-video-broken-tooltip');
  }

  return (
    <FailureBadge title={errorText}>
      {audioBroken && <MicOnIcon color="error" fontSize="medium" />}
      {videoBroken && <CameraOnIcon color="error" fontSize="medium" />}
    </FailureBadge>
  );
};

export default BrokenSubscriberIndicator;
