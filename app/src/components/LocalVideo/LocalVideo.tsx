// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { VideoTrack, useTracks } from '@livekit/components-react';
import { CircularProgress, Grid, Typography, styled } from '@mui/material';
import { Track } from 'livekit-client';
import { RefObject, useCallback, useEffect, useRef } from 'react';
import { VideoHTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';

import { PinIcon } from '../../assets/icons';
import { NameTile } from '../../commonComponents';
import { useAppSelector } from '../../hooks';
import { useMediaChoices } from '../../provider/MediaChoicesProvider';
import { selectVideoBackgroundEffects } from '../../store/slices/mediaSlice';
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
  const videoTrackRef = useTracks([Track.Source.Camera]).find((trackRef) => trackRef.participant.isLocal);
  const screenShareTrackRef = useTracks([Track.Source.ScreenShare]).find((trackRef) => trackRef.participant.isLocal);

  const mediaChoices = useMediaChoices();
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoThumbnailRef = useRef<HTMLVideoElement>(null);

  const displayName = useAppSelector(selectDisplayName);
  const mirroredVideoEnabled = useAppSelector(selectMirroredVideoEnabled);
  const backgroundEffects = useAppSelector(selectVideoBackgroundEffects);

  const isVideoEnabled = mediaChoices?.userChoices.videoEnabled || false;
  const isAudioEnabled = mediaChoices?.userChoices.audioEnabled || false;
  const screenShareEnabled = screenShareTrackRef?.participant.isScreenShareEnabled || false;

  const outgoingVideoStream = videoTrackRef?.publication.track?.mediaStream || null;
  let outgoingScreenStream: MediaStream | null = null;
  if (screenShareTrackRef) {
    outgoingScreenStream = screenShareTrackRef?.publication.track?.mediaStream || null;
  }

  const isVideoRunning =
    outgoingVideoStream?.getVideoTracks().find((t) => t.enabled && t.readyState === 'live') !== undefined;
  const showLoadingSpinner =
    isVideoEnabled && (outgoingVideoStream === null || !outgoingVideoStream?.active) && !isVideoRunning;
  const isVideoMissing =
    mediaChoices?.userChoices.videoEnabled &&
    videoTrackRef?.publication.track?.isMuted &&
    !videoTrackRef?.publication.track.mediaStreamTrack;

  const attachVideo = useCallback((refObject: RefObject<HTMLVideoElement>, stream: MediaStream | null) => {
    if (refObject.current !== null) {
      refObject.current.volume = 0;
      refObject.current.srcObject = stream;
      refObject.current.playsInline = true;
    }
  }, []);

  const detachVideo = useCallback((refObject: RefObject<HTMLVideoElement>) => {
    if (refObject.current !== null) {
      refObject.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    if (screenShareEnabled && isVideoEnabled) {
      attachVideo(videoThumbnailRef, outgoingVideoStream);
      attachVideo(videoRef, outgoingScreenStream);
      return;
    }
    if (isVideoEnabled) {
      attachVideo(videoRef, outgoingVideoStream);
      detachVideo(videoThumbnailRef);
      return;
    }
    if (screenShareEnabled) {
      attachVideo(videoRef, outgoingScreenStream);
      detachVideo(videoThumbnailRef);
      return;
    }
    videoTrackRef?.publication.track?.mediaStreamTrack.stop();
    screenShareTrackRef?.publication.track?.mediaStreamTrack.stop();
    detachVideo(videoRef);
    detachVideo(videoThumbnailRef);
  }, [
    outgoingVideoStream,
    outgoingScreenStream,
    screenShareEnabled,
    attachVideo,
    detachVideo,
    backgroundEffects,
    isVideoEnabled,
    videoTrackRef,
    screenShareTrackRef,
    backgroundEffects,
  ]);

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
            localAudioOn={fullscreenMode ? isAudioEnabled : true}
            localVideoOn={fullscreenMode ? isVideoEnabled : true}
            displayName={displayName || ''}
            className="positionBottom"
          />
        </>
      )}
      {showLoadingSpinner && <CircularProgress color="primary" size="2.5rem" />}
      {isVideoMissing && <NoVideoText>{t('localvideo-no-device')}</NoVideoText>}
    </Container>
  );
};

export default LocalVideo;
