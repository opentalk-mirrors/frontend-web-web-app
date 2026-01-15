// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useRemoteParticipant } from '@livekit/components-react';
import { Slide, styled } from '@mui/material';
import { Track } from 'livekit-client';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAppDispatch, useAppSelector } from '../../../hooks';
import { MediaDescriptor } from '../../../modules/WebRTC';
import { selectQualityCap } from '../../../store/slices/livekitSlice';
import {
  presenterVideoPositions,
  selectPresenterVideoPosition,
  setPresenterVideoPosition,
  presenterOverlayPinnedParticipantIdSet,
  selectPresenterOverlayPinnedParticipantId,
} from '../../../store/slices/uiSlice';
import { ParticipantId, VideoSetting } from '../../../types';
import { AvatarContainer } from './AvatarContainer';
import RemoteVideo from './RemoteVideo';
import ScreenPresenterVideo from './ScreenPresenterVideo';

const ScreenShareContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  '& video': {
    aspectRatio: '16 / 9',
  },
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

  const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null);
  const [showPresenterVideo, setShowPresenterVideo] = useState<boolean>(!!presenterVideoIsActive);
  const presenterOverlayPinnedParticipantId = useAppSelector(selectPresenterOverlayPinnedParticipantId);
  const isVideoPinned = presenterOverlayPinnedParticipantId === participantId;
  const presenterVideoPosition = useAppSelector(selectPresenterVideoPosition);

  const slideDirection = presenterVideoPosition === 'upperRight' ? 'down' : 'up';
  const isVisible = isVideoPinned || presenterVideoIsActive || showPresenterVideo;

  useEffect(() => {
    if (!showPresenterVideo) {
      return;
    }
    const timer = setTimeout(() => setShowPresenterVideo(false), 5000);
    return () => clearTimeout(timer);
  }, [showPresenterVideo]);

  useEffect(() => {
    // Update the track subscription state of remote videos if the config flag changes
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

  const togglePin = () => {
    dispatch(presenterOverlayPinnedParticipantIdSet(isVideoPinned ? undefined : participantId));
  };

  const movePresenterVideo = () => {
    const currentIndex = presenterVideoPositions.indexOf(presenterVideoPosition);
    const nextIndex = (currentIndex + 1) % 3;
    dispatch(setPresenterVideoPosition(presenterVideoPositions[nextIndex]));
  };

  const handleContainerRef = useCallback((node: HTMLDivElement | null) => {
    setContainerElement(node);
  }, []);

  if (participant?.isScreenShareEnabled) {
    return (
      <ScreenShareContainer
        onMouseMove={displayPresenterVideo}
        data-testid="participantScreenShareVideo"
        ref={handleContainerRef}
      >
        <RemoteVideo descriptor={screenDescriptor} />
        {showCamera && (
          <Slide direction={slideDirection} in={isVisible} mountOnEnter container={containerElement}>
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
      </ScreenShareContainer>
    );
  }

  if (showCamera) {
    return <RemoteVideo descriptor={videoDescriptor} />;
  }

  return <AvatarContainer participantId={participantId} />;
};

export default ParticipantVideo;
