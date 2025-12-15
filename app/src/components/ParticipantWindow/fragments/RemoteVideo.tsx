// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
/*  Since we probably won't be able to provide a real time transcription for videos as of now, media-has-caption will be disabled for now.*/
import { VideoTrack, useParticipantTracks } from '@livekit/components-react';
import { CircularProgress, Grid, styled } from '@mui/material';
import { VideoHTMLAttributes, useRef } from 'react';

import { MediaDescriptor, idFromDescriptor } from '../../../modules/WebRTC';

const Container = styled(Grid)({
  width: '100%',
  height: '100%',
});

const Loader = styled(CircularProgress)(({ theme }) => ({
  marginTop: theme.spacing(3),
}));

const Video = styled(VideoTrack)({
  width: '100%',
  height: '100%',
});

type IRemoteVideoProps = VideoHTMLAttributes<HTMLVideoElement> & {
  descriptor: MediaDescriptor;
};

const RemoteVideo = ({ descriptor }: IRemoteVideoProps) => {
  const videoTrack = useParticipantTracks([descriptor.mediaType], descriptor.connectionIdentifier)[0];
  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <Container
      ref={containerRef}
      container
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      data-testid={`remoteVideo-${idFromDescriptor(descriptor)}`}
    >
      {videoTrack ? <Video muted autoPlay trackRef={videoTrack} /> : <Loader />}
    </Container>
  );
};

export default RemoteVideo;
