// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { usePreviewTracks } from '@livekit/components-react';
import { CircularProgress, Grid, Typography, styled } from '@mui/material';
import { LocalVideoTrack, Track } from 'livekit-client';
import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from '../../../hooks';
import { BackgroundBlur } from '../../../modules/Media/BackgroundBlur';
import {
  selectVideoBackgroundEffects,
  selectVideoDeviceId,
  selectVideoEnabled,
} from '../../../store/slices/mediaSlice';
import { selectMirroredVideoEnabled } from '../../../store/slices/uiSlice';

const Container = styled(Grid)({
  position: 'relative',
  minWidth: '100%',
  minHeight: '100%',
  '&::before': {
    content: '""',
    top: 0,
    left: 0,
    display: 'block',
    height: 0,
    width: 0,
    paddingBottom: 'calc(9/16 * 100%)',
  },
});

const NoVideoText = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  transform: 'translateY(50%)',
  background: 'rgba(38, 48, 61, 0.95)',
  color: 'white',
  borderRadius: theme.borderRadius.medium,
  padding: '1ex',
}));

const Video = styled('video', {
  shouldForwardProp: (prop) => !['noRoundedCorners', 'mirroringEnabled'].includes(prop as string),
})<{ noRoundedCorners?: boolean; mirroringEnabled?: boolean }>(({ theme, noRoundedCorners, mirroringEnabled }) => ({
  position: 'absolute',
  minHeight: '100%',
  maxWidth: '100%',
  maxHeight: '100%',
  borderRadius: noRoundedCorners ? 0 : theme.borderRadius.medium,
  transform: mirroringEnabled ? 'scale(-1,1)' : '',
}));

const VideoElement = () => {
  const { t } = useTranslation();
  const videoEnabled = useAppSelector(selectVideoEnabled);
  const videoDeviceId = useAppSelector(selectVideoDeviceId);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoBackgroundEffects = useAppSelector(selectVideoBackgroundEffects);
  const mirroredVideoEnabled = useAppSelector(selectMirroredVideoEnabled);

  const videoProcessor = new BackgroundBlur(videoBackgroundEffects);

  const previewTracks = usePreviewTracks({
    video: videoEnabled && { deviceId: videoDeviceId, processor: videoProcessor },
  });

  const videoTrack = useMemo(
    () => previewTracks?.filter((track) => track.kind === Track.Kind.Video)[0] as LocalVideoTrack,
    [previewTracks]
  );

  const isVideoMissing = videoEnabled && videoTrack?.isMuted;

  useEffect(() => {
    if (videoTrack && videoRef.current) {
      videoTrack.unmute();
      videoTrack.attach(videoRef.current);
    }
    return () => {
      videoTrack?.detach();
    };
  }, [videoTrack]);

  if (!videoTrack) {
    return <CircularProgress color="primary" size="4rem" />;
  }

  return (
    <Container container justifyContent="center" alignItems="center" flexDirection="column">
      <Video ref={videoRef} noRoundedCorners mirroringEnabled={mirroredVideoEnabled} />
      {isVideoMissing && <NoVideoText>{t('localvideo-no-device')}</NoVideoText>}
    </Container>
  );
};

export default VideoElement;
