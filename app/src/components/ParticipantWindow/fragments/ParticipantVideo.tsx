// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useParticipantContext } from '@livekit/components-react';
import { Slide, styled } from '@mui/material';
import { RemoteParticipant, Track } from 'livekit-client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAppSelector } from '../../../hooks';
import { MediaDescriptor } from '../../../modules/WebRTC';
import { selectQualityCap } from '../../../store/slices/livekitSlice';
import { ParticipantId, VideoSetting } from '../../../types';
import { AvatarContainer } from './AvatarContainer';
import { PresenterVideoPosition } from './PresenterOverlay';
import RemoteVideo from './RemoteVideo';
import ScreenPresenterVideo from './ScreenPresenterVideo';

const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
});

interface ParticipantVideoProps {
  participantId: ParticipantId;
  presenterVideoIsActive?: boolean;
  isThumbnail?: boolean;
}

const ParticipantVideo = ({ participantId, presenterVideoIsActive, isThumbnail }: ParticipantVideoProps) => {
  const participant = useParticipantContext() as RemoteParticipant;

  const videoDescriptor = useMemo<MediaDescriptor>(
    () => ({ participantId, mediaType: Track.Source.Camera }),
    [participantId]
  );
  const screenDescriptor = useMemo<MediaDescriptor>(
    () => ({ participantId, mediaType: Track.Source.ScreenShare }),
    [participantId]
  );

  const qualityCap = useAppSelector(selectQualityCap);
  const areParticipantVideosEnabled = qualityCap !== VideoSetting.Off;
  const showCamera = participant.isCameraEnabled && areParticipantVideosEnabled;

  const containerRef = useRef(null);
  const [isVideoPinned, setIsVideoPinned] = useState<boolean>(false);
  const [showPresenterVideo, setShowPresenterVideo] = useState<boolean>(!!presenterVideoIsActive);

  const [presenterVideoPosition, setPresenterVideoPosition] = useState<PresenterVideoPosition>('bottomRight');
  const positionsArray: Array<PresenterVideoPosition> = ['bottomLeft', 'upperRight', 'bottomRight'];

  const slideDirection = presenterVideoPosition === 'upperRight' ? 'down' : 'up';
  const isVisible = isVideoPinned || presenterVideoIsActive || showPresenterVideo;

  useEffect(() => {
    const timer = setTimeout(() => setShowPresenterVideo(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Update the track subscripton state of remote videos if the config flag changes
    participant.videoTrackPublications.forEach((publication) => {
      const updateSubscriptionState = publication.isSubscribed !== areParticipantVideosEnabled;
      if (updateSubscriptionState && publication.source !== Track.Source.ScreenShare) {
        publication.setSubscribed(areParticipantVideosEnabled);
      }
    });
  }, [areParticipantVideosEnabled, participant.videoTrackPublications]);

  const displayPresenterVideo = useCallback(() => {
    !presenterVideoIsActive && setShowPresenterVideo(true);
  }, [presenterVideoIsActive]);

  const handleToggle = () => setIsVideoPinned((videoPinned) => !videoPinned);

  const movePresenterVideo = () => {
    const currentIndex = positionsArray.indexOf(presenterVideoPosition);
    const nextIndex = (currentIndex + 1) % 3;
    setPresenterVideoPosition(positionsArray[nextIndex]);
  };

  if (participant.isScreenShareEnabled) {
    return (
      <Container onMouseMove={displayPresenterVideo} data-testid="participantSreenShareVideo" ref={containerRef}>
        <RemoteVideo descriptor={screenDescriptor} />
        <Slide direction={slideDirection} in={isVisible} mountOnEnter container={containerRef.current}>
          <ScreenPresenterVideo
            participantId={participantId}
            isVideoPinned={isVideoPinned}
            togglePin={handleToggle}
            videoPosition={presenterVideoPosition}
            changeVideoPosition={movePresenterVideo}
            isThumbnail={isThumbnail}
          />
        </Slide>
      </Container>
    );
  }

  if (showCamera) {
    return <RemoteVideo descriptor={videoDescriptor} />;
  }

  return <AvatarContainer participantId={participantId} />;
};

export default ParticipantVideo;
