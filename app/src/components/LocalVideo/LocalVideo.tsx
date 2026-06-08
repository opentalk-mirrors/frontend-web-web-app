// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { TrackReference } from '@livekit/components-core';
import { VideoTrack, useTracks } from '@livekit/components-react';
import { useLocalParticipant } from '@livekit/components-react';
import { CircularProgress, Grid, Typography, styled } from '@mui/material';
import { RoomEvent, Track } from 'livekit-client';
import { VideoHTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';

import { PinIcon, WarningIcon } from '../../assets/icons';
import { NameTile } from '../../commonComponents';
import { useAppSelector } from '../../hooks';
import useMediaDevice from '../../hooks/useMediaDevice';
import { selectLivekitUnavailable } from '../../store/slices/livekitSlice';
import { selectMirroredVideoEnabled } from '../../store/slices/uiSlice';
import { selectDisplayName, selectOurUuid } from '../../store/slices/userSlice';
import { OverlayIconButton } from '../ParticipantWindow/fragments/OverlayIconButton';
import ReactionIndicator from '../ParticipantWindow/fragments/ReactionIndicator';

type PropsType = VideoHTMLAttributes<HTMLVideoElement>;

const Container = styled(Grid)({
  position: 'relative',
  containerType: 'inline-size',

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
  const screenShareTrackRef = useTracks([Track.Source.ScreenShare], {
    updateOnlyOn: [RoomEvent.ActiveDeviceChanged, RoomEvent.TrackUnpublished],
  }).find((trackRef) => trackRef.participant.isLocal);
  const { t } = useTranslation();
  const { cameraTrack, localParticipant, isCameraEnabled, isMicrophoneEnabled, isScreenShareEnabled } =
    useLocalParticipant();

  const displayName = useAppSelector(selectDisplayName);
  const ownParticipantId = useAppSelector(selectOurUuid);
  const mirroredVideoEnabled = useAppSelector(selectMirroredVideoEnabled);
  const isLivekitUnavailable = useAppSelector(selectLivekitUnavailable);
  const { devices } = useMediaDevice({ kind: 'videoinput' });

  const videoTrackRef: TrackReference | undefined = cameraTrack && {
    participant: localParticipant,
    publication: cameraTrack,
    source: cameraTrack.source,
  };

  const videoTrack = videoTrackRef?.publication?.videoTrack;

  const outgoingVideoStreamTrack = videoTrack?.mediaStreamTrack || null;

  /* TODO will not update - use cameraTrack event handler
     we use outgoingVideoStreamTrack in the meantime
  const isVideoRunning = cameraTrack?.videoTrack
    outgoingVideoStreamTrack?.enabled &&
    outgoingVideoStreamTrack?.readyState === 'live' &&
    !outgoingVideoStreamTrack?.muted;
  */
  return (
    <Container container justifyContent="center" alignItems="center">
      {(isCameraEnabled || isScreenShareEnabled) && (screenShareTrackRef || videoTrackRef) && (
        <>
          {fullscreenMode && (
            <PinIconButton
              aria-label={t('indicator-pinned', {
                participantName: displayName || '',
              })}
              onClick={togglePinVideo}
              aria-pressed={isVideoPinned}
            >
              <PinIcon />
            </PinIconButton>
          )}
          <Video
            trackRef={screenShareTrackRef || videoTrackRef}
            noRoundedCorners={noRoundedCorners}
            mirroringEnabled={mirroredVideoEnabled && !isScreenShareEnabled}
          />
          {isScreenShareEnabled && isCameraEnabled && videoTrackRef && (
            <ThumbnailVideo
              trackRef={videoTrackRef}
              noRoundedCorners={noRoundedCorners}
              mirroringEnabled={mirroredVideoEnabled}
            />
          )}
          <NameTile
            audioOn={!fullscreenMode || isMicrophoneEnabled}
            videoOn={!fullscreenMode || isCameraEnabled}
            displayName={displayName || ''}
            className="positionBottom"
          />
        </>
      )}
      {ownParticipantId !== null && <ReactionIndicator participantId={ownParticipantId} />}
      {isCameraEnabled && !outgoingVideoStreamTrack && !isLivekitUnavailable && (
        <CircularProgress color="primary" size="2.5rem" />
      )}
      {isLivekitUnavailable && <WarningIcon color="error" fontSize="large" />}
      {devices.length === 0 && <NoVideoText>{t('localvideo-no-device')}</NoVideoText>}
    </Container>
  );
};

export default LocalVideo;
