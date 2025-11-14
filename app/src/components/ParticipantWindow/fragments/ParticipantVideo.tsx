// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useRemoteParticipant } from '@livekit/components-react';
import { Slide, styled } from '@mui/material';
import { Track } from 'livekit-client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAppDispatch, useAppSelector } from '../../../hooks';
import { MediaDescriptor } from '../../../modules/WebRTC';
import { selectQualityCap } from '../../../store/slices/livekitSlice';
import {
  pinnedParticipantIdSet,
  presenterVideoPositions,
  selectPinnedParticipantId,
  selectPresenterVideoPosition,
  setPresenterVideoPosition,
} from '../../../store/slices/uiSlice';
import { ParticipantId, VideoSetting } from '../../../types';
import { AvatarContainer } from './AvatarContainer';
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
  const participant = useRemoteParticipant(participantId);
  const dispatch = useAppDispatch();

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
  const showCamera = participant?.isCameraEnabled && areParticipantVideosEnabled;

  const containerRef = useRef(null);
  const [showPresenterVideo, setShowPresenterVideo] = useState<boolean>(!!presenterVideoIsActive);
  const pinnedParticipantId = useAppSelector(selectPinnedParticipantId);
  const isVideoPinned = pinnedParticipantId === participantId;
  const presenterVideoPosition = useAppSelector(selectPresenterVideoPosition);

  const slideDirection = presenterVideoPosition === 'upperRight' ? 'down' : 'up';
  const isVisible = isVideoPinned || presenterVideoIsActive || showPresenterVideo;

  useEffect(() => {
    const timer = setTimeout(() => setShowPresenterVideo(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Update the track subscripton state of remote videos if the config flag changes
    participant?.videoTrackPublications.forEach((publication) => {
      const updateSubscriptionState = publication.isSubscribed !== areParticipantVideosEnabled;
      if (updateSubscriptionState && publication.source !== Track.Source.ScreenShare) {
        publication.setSubscribed(areParticipantVideosEnabled);
      }
    });
  }, [areParticipantVideosEnabled, participant?.videoTrackPublications]);

  const displayPresenterVideo = useCallback(() => {
    !presenterVideoIsActive && setShowPresenterVideo(true);
  }, [presenterVideoIsActive]);

  const togglePin = useCallback(() => {
    const updatePinnedId = pinnedParticipantId === participantId ? undefined : participantId;
    dispatch(pinnedParticipantIdSet(updatePinnedId));
  }, [dispatch, participantId, pinnedParticipantId]);

  const movePresenterVideo = () => {
    const currentIndex = presenterVideoPositions.indexOf(presenterVideoPosition);
    const nextIndex = (currentIndex + 1) % 3;
    dispatch(setPresenterVideoPosition(presenterVideoPositions[nextIndex]));
  };

  if (participant?.isScreenShareEnabled) {
    return (
      <Container onMouseMove={displayPresenterVideo} data-testid="participantSreenShareVideo" ref={containerRef}>
        <RemoteVideo descriptor={screenDescriptor} />
        {showCamera && (
          <Slide direction={slideDirection} in={isVisible} mountOnEnter container={containerRef.current}>
            <ScreenPresenterVideo
              participantId={participantId}
              isVideoPinned={isVideoPinned}
              togglePin={togglePin}
              videoPosition={presenterVideoPosition}
              changeVideoPosition={movePresenterVideo}
              isThumbnail={isThumbnail}
            />
          </Slide>
        )}
      </Container>
    );
  }

  if (showCamera) {
    return <RemoteVideo descriptor={videoDescriptor} />;
  }

  return <AvatarContainer participantId={participantId} />;
};

export default ParticipantVideo;
