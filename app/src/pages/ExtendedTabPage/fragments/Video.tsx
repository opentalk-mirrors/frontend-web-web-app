// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { VideoTrack, TrackReference } from '@livekit/components-react';
import { styled, CircularProgress } from '@mui/material';
import { RemoteParticipant, RemoteTrackPublication } from 'livekit-client';
import { Room } from 'livekit-client';
import { useEffect, useState } from 'react';

import { MediaDescriptor } from '../../../modules/WebRTC';

const StyledVideoTrack = styled(VideoTrack)({
  height: 'inherit',
});

const WAIT_FOR_LIVEKIT_ROOM_UPDATE = 500;

const Video = ({ mediaDescriptor, room }: { mediaDescriptor: MediaDescriptor; room: Room }) => {
  const [videoTrack, setVideoTrack] = useState<RemoteTrackPublication | undefined>();
  const [participant, setParticipant] = useState<RemoteParticipant | undefined>();

  useEffect(() => {
    if (videoTrack === undefined) {
      setTimeout(() => {
        const participant = room.remoteParticipants.get(mediaDescriptor.participantId);
        setParticipant(participant);
        const videoTrack = participant?.getTrackPublication(mediaDescriptor.mediaType);
        setVideoTrack(videoTrack);
      }, WAIT_FOR_LIVEKIT_ROOM_UPDATE);
    }
  }, [room]);

  if (videoTrack === undefined) {
    return <CircularProgress />;
  }

  const trackReference = {
    participant: participant,
    publication: videoTrack,
    source: mediaDescriptor.mediaType,
  } as TrackReference;

  return <StyledVideoTrack muted autoPlay trackRef={trackReference} />;
};

export default Video;
