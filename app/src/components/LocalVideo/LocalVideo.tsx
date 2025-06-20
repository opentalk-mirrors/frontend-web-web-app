// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { VideoTrack, useTracks } from '@livekit/components-react';
import { CircularProgress, Grid, Typography, styled } from '@mui/material';
import { RoomEvent, Track, LocalVideoTrack } from 'livekit-client';
import { useEffect } from 'react';
import { VideoHTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';

import { PinIcon, WarningIcon } from '../../assets/icons';
import { NameTile } from '../../commonComponents';
import { useAppSelector } from '../../hooks';
import log from '../../logger';
import { BackgroundBlur } from '../../modules/Media/BackgroundBlur';
import { selectLivekitUnavailable } from '../../store/slices/livekitSlice';
import { selectAudioEnabled, selectVideoBackgroundEffects, selectVideoEnabled } from '../../store/slices/mediaSlice';
import { selectMirroredVideoEnabled } from '../../store/slices/uiSlice';
import { selectDisplayName } from '../../store/slices/userSlice';
import { OverlayIconButton } from '../ParticipantWindow/fragments/OverlayIconButton';

type PropsType = VideoHTMLAttributes<HTMLVideoElement>;

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

const Video = styled(VideoTrack, {
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

const ThumbnailVideo = styled(Video)(({ theme }) => ({
  right: theme.spacing(1),
  bottom: theme.spacing(1),
  maxWidth: 100,
}));

const PinIconButton = styled(OverlayIconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  left: theme.spacing(1),
  zIndex: theme.zIndex.mobileStepper,
}));

interface LocalVideoProps extends PropsType {
  noRoundedCorners?: boolean;
  fullscreenMode?: boolean;
  isVideoPinned?: boolean;
  togglePinVideo?: () => void;
}

const LocalVideo = ({ noRoundedCorners, fullscreenMode, togglePinVideo, isVideoPinned }: LocalVideoProps) => {
  const videoTrackRef = useTracks([Track.Source.Camera], { updateOnlyOn: [RoomEvent.ActiveDeviceChanged] }).find(
    (trackRef) => trackRef.participant.isLocal
  );

  const screenShareTrackRef = useTracks([Track.Source.ScreenShare], {
    updateOnlyOn: [RoomEvent.ActiveDeviceChanged],
  }).find((trackRef) => trackRef.participant.isLocal);
  const isVideoEnabled = useAppSelector(selectVideoEnabled);
  const isAudioEnabled = useAppSelector(selectAudioEnabled);
  const videoBackgroundEffects = useAppSelector(selectVideoBackgroundEffects);
  const { t } = useTranslation();

  const displayName = useAppSelector(selectDisplayName);
  const mirroredVideoEnabled = useAppSelector(selectMirroredVideoEnabled);
  const isLivekitUnavailable = useAppSelector(selectLivekitUnavailable);

  const screenShareEnabled = screenShareTrackRef?.participant.isScreenShareEnabled || false;

  const videoTrack = videoTrackRef?.publication?.videoTrack;
  const videoProcessor = new BackgroundBlur(videoBackgroundEffects);

  useEffect(() => {
    if (videoProcessor && videoTrack instanceof LocalVideoTrack) {
      videoTrack.setProcessor(videoProcessor).catch((e) => log.error('set video processor', e));
    }
  }, [videoProcessor]);

  const outgoingVideoStreamTrack = videoTrack?.mediaStreamTrack || null;

  const isVideoRunning = outgoingVideoStreamTrack?.readyState === 'live' && outgoingVideoStreamTrack?.enabled;
  const showLoadingSpinner =
    isVideoEnabled && (outgoingVideoStreamTrack === null || outgoingVideoStreamTrack?.muted) && !isVideoRunning;
  const isVideoMissing = isVideoEnabled && videoTrack?.isMuted && !videoTrack?.mediaStreamTrack;

  return (
    <Container container justifyContent="center" alignItems="center">
      {(isVideoEnabled || screenShareEnabled) && (screenShareTrackRef || videoTrackRef) && (
        <>
          {fullscreenMode && (
            <PinIconButton
              onClick={togglePinVideo}
              aria-label={t('indicator-pinned', {
                participantName: displayName || '',
              })}
              color={isVideoPinned ? 'primary' : 'secondary'}
            >
              <PinIcon />
            </PinIconButton>
          )}
          <Video
            trackRef={screenShareTrackRef || videoTrackRef}
            noRoundedCorners={noRoundedCorners}
            mirroringEnabled={mirroredVideoEnabled && !screenShareEnabled}
          />
          {screenShareEnabled && isVideoEnabled && videoTrackRef && (
            <ThumbnailVideo
              trackRef={videoTrackRef}
              noRoundedCorners={noRoundedCorners}
              mirroringEnabled={mirroredVideoEnabled}
            />
          )}
          <NameTile
            localAudioOn={!fullscreenMode || isAudioEnabled}
            localVideoOn={!fullscreenMode || isVideoEnabled}
            displayName={displayName || ''}
            className="positionBottom"
          />
        </>
      )}
      {showLoadingSpinner && !isLivekitUnavailable && <CircularProgress color="primary" size="2.5rem" />}
      {isLivekitUnavailable && <WarningIcon color="error" fontSize="large" />}
      {isVideoMissing && <NoVideoText>{t('localvideo-no-device')}</NoVideoText>}
    </Container>
  );
};

export default LocalVideo;
