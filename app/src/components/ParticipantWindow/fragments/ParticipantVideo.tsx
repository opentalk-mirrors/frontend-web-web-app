// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useRemoteParticipant } from '@livekit/components-react';
import { Slide, styled } from '@mui/material';
import { ParticipantEvent, Track } from 'livekit-client';
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
import { ConnectionIdentifier, VideoSetting } from '../../../types';
import { deconstructConnectionIdentifier } from '../../../utils/deconstructConnectionIdentifier';
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
  connectionIdentifier: ConnectionIdentifier;
  presenterVideoIsActive?: boolean;
  isThumbnail?: boolean;
}

const ParticipantVideo = ({ connectionIdentifier, presenterVideoIsActive, isThumbnail }: ParticipantVideoProps) => {
  const participant = useRemoteParticipant(connectionIdentifier, {
    updateOnlyOn: [
      ParticipantEvent.TrackMuted,
      ParticipantEvent.TrackUnmuted,
      ParticipantEvent.TrackSubscribed,
      ParticipantEvent.TrackUnsubscribed,
    ],
  });
  const dispatch = useAppDispatch();
  const { participantId } = deconstructConnectionIdentifier(connectionIdentifier);

  const videoDescriptor = useMemo<MediaDescriptor>(
    () => ({ connectionIdentifier, mediaType: Track.Source.Camera }),
    [connectionIdentifier]
  );
  const screenDescriptor = useMemo<MediaDescriptor>(
    () => ({ connectionIdentifier, mediaType: Track.Source.ScreenShare }),
    [connectionIdentifier]
  );

  const qualityCap = useAppSelector(selectQualityCap);
  const areParticipantVideosEnabled = qualityCap !== VideoSetting.Off;
  const showCamera = participant?.isCameraEnabled && areParticipantVideosEnabled;

  const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null);
  const [showPresenterVideo, setShowPresenterVideo] = useState<boolean>(!!presenterVideoIsActive);
  const presenterOverlayPinnedParticipantId = useAppSelector(selectPresenterOverlayPinnedParticipantId);
  const isVideoPinned = presenterOverlayPinnedParticipantId === connectionIdentifier;
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
    dispatch(presenterOverlayPinnedParticipantIdSet(isVideoPinned ? undefined : connectionIdentifier));
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
              connectionIdentifier={connectionIdentifier}
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
