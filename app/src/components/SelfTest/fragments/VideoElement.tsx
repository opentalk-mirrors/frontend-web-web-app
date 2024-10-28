// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { CircularProgress, Grid, Typography, styled } from '@mui/material';
import { LocalVideoTrack, createLocalVideoTrack } from 'livekit-client';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from '../../../hooks';
import { useManageVideoEffect } from '../../../hooks/useManageVideoEffect';
import { useMediaChoices } from '../../../provider/MediaChoicesProvider';
import { selectMirroredVideoEnabled } from '../../../store/slices/uiSlice';

const Container = styled(Grid)({
  position: 'relative',
  '&::before': {
    content: '""',
    top: 0,
    left: 0,
    display: 'block',
    height: 0,
    width: '0',
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
  width: 'inherit',
  height: 'inherit',
  maxWidth: '100%',
  maxHeight: '100%',
  borderRadius: noRoundedCorners ? 0 : theme.borderRadius.medium,
  transform: mirroringEnabled ? 'scale(-1,1)' : '',
}));

const VideoElement = () => {
  const { t } = useTranslation();
  const mediaChoices = useMediaChoices();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [videoTrack, setLocalVideoTrack] = useState<LocalVideoTrack | undefined>();

  useEffect(() => {
    let dismounted = false;
    mediaChoices?.userChoices.videoEnabled &&
      createLocalVideoTrack({ deviceId: mediaChoices?.userChoices.videoDeviceId })
        .then((videoTrack) => {
          if (dismounted) {
            return;
          }

          setLocalVideoTrack(videoTrack);
        })
        .catch((err) => {
          mediaChoices?.saveVideoInputEnabled(false);
          if (err.name !== 'NotAllowedError') {
            console.error('Error while publishing video track: ', err);
          }
        });
    return () => {
      dismounted = true;
    };
  }, [
    mediaChoices?.userChoices.videoDeviceId,
    mediaChoices?.userChoices.videoEnabled,
    mediaChoices?.saveVideoInputEnabled,
  ]);

  useManageVideoEffect(true, videoTrack);

  const mirroredVideoEnabled = useAppSelector(selectMirroredVideoEnabled);

  const isVideoMissing = mediaChoices?.userChoices.videoEnabled && videoTrack?.isMuted;

  useEffect(() => {
    if (videoRef.current && videoTrack) {
      videoTrack.unmute();
      videoTrack.attach(videoRef.current);
    }
    return () => {
      videoTrack?.mediaStreamTrack.stop();
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
