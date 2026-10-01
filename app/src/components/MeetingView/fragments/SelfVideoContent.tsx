// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { TrackReference } from '@livekit/components-core';
import { VideoTrack, useLocalParticipant } from '@livekit/components-react';
import { Box, CircularProgress, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from '../../../hooks';
import { selectMediaChange } from '../../../store/slices/livekitSlice';
import { selectMirroredVideoEnabled } from '../../../store/slices/uiSlice';
import { selectAvatarUrl } from '../../../store/slices/userSlice';
import ParticipantVideoFallback from '../../ParticipantVideoFallback';

const Video = styled(VideoTrack, {
  shouldForwardProp: (prop) => !['mirroringEnabled'].includes(prop as string),
})<{ mirroringEnabled?: boolean }>(({ mirroringEnabled }) => ({
  display: 'block',
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transform: mirroringEnabled ? 'scale(-1,1)' : 'none',
}));

const LoadingContainer = styled(Box)({
  display: 'flex',
  width: '100%',
  height: '100%',
  justifyContent: 'center',
  alignItems: 'center',
});

export interface SelfVideoContentProps {
  displayName: string;
}

const SelfVideoContent = ({ displayName }: SelfVideoContentProps) => {
  const { t } = useTranslation();
  const { cameraTrack, localParticipant, isCameraEnabled } = useLocalParticipant();
  const avatarUrl = useAppSelector(selectAvatarUrl);
  const mirroredVideoEnabled = useAppSelector(selectMirroredVideoEnabled);
  const videoChange = useAppSelector((state) => selectMediaChange(state, 'videoinput'));

  const videoTrackRef: TrackReference | undefined = cameraTrack && {
    participant: localParticipant,
    publication: cameraTrack,
    source: cameraTrack.source,
  };
  const isVideoOff = !isCameraEnabled || !videoTrackRef?.publication.videoTrack?.mediaStreamTrack;
  const isVideoTurnsOn = Boolean(videoChange?.enabled);
  const isLoading = isVideoTurnsOn && isVideoOff;

  if (isLoading) {
    return (
      <LoadingContainer>
        <CircularProgress color="primary" size="2.5rem" aria-label={t('global-video-loading')} />
      </LoadingContainer>
    );
  }
  if (isVideoOff) {
    return <ParticipantVideoFallback avatarUrl={avatarUrl} displayName={displayName} />;
  }
  return <Video trackRef={videoTrackRef} mirroringEnabled={mirroredVideoEnabled} />;
};

export default SelfVideoContent;
