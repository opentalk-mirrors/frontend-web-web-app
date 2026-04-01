// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { VideoTrack, TrackReference } from '@livekit/components-react';
import { styled, CircularProgress } from '@mui/material';
import { RemoteParticipant, RemoteTrackPublication } from 'livekit-client';
import { Room } from 'livekit-client';
import { debounce } from 'lodash';
import { useCallback, useEffect, useState } from 'react';

import { MediaDescriptor } from '../../../modules/WebRTC';

const StyledVideoTrack = styled(VideoTrack, { shouldForwardProp: (prop) => prop !== 'height' })<{
  height: number | string;
}>(({ height }) => ({
  height,
  width: '100%',
}));

const WAIT_FOR_LIVEKIT_ROOM_UPDATE = 2000;

const Video = ({ mediaDescriptor, room }: { mediaDescriptor: MediaDescriptor; room: Room }) => {
  const [videoTrack, setVideoTrack] = useState<RemoteTrackPublication | undefined>();
  const [participant, setParticipant] = useState<RemoteParticipant | undefined>();
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (videoTrack === undefined) {
      timeout = setTimeout(() => {
        const participant = room.remoteParticipants.get(mediaDescriptor.connectionIdentifier);
        setParticipant(participant);
        const participantVideoTrack = participant?.getTrackPublication(mediaDescriptor.mediaType);
        setVideoTrack(participantVideoTrack);
      }, WAIT_FOR_LIVEKIT_ROOM_UPDATE);
    }
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [mediaDescriptor.mediaType, mediaDescriptor.connectionIdentifier, room, videoTrack]);

  const handleResize = useCallback(() => {
    setWindowHeight(window.innerHeight);
  }, []);

  useEffect(() => {
    const debouncedHandleResize = debounce(handleResize);

    debouncedHandleResize();
    window.addEventListener('resize', debouncedHandleResize);
    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
    };
  }, [handleResize]);

  if (videoTrack === undefined) {
    return <CircularProgress />;
  }

  const trackReference = {
    participant: participant,
    publication: videoTrack,
    source: mediaDescriptor.mediaType,
  } as TrackReference;

  return <StyledVideoTrack muted autoPlay trackRef={trackReference} height={windowHeight} />;
};

export default Video;
