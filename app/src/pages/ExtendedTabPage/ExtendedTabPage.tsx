// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { LiveKitRoom } from '@livekit/components-react';
import { CircularProgress, styled } from '@mui/material';
import { useParams } from 'react-router-dom';

import useE2EE from '../../hooks/useE2EE';
import useRoom from '../../hooks/useRoom';
import Video from './fragments/Video';
import { useBroadcastChannel } from './hooks/useBroadcastChannel';

const RoomContainer = styled(LiveKitRoom)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: 'inherit',
});

const ExtendedTabPage = () => {
  const { channelId } = useParams();
  const { accessToken, mediaType, participantId, livekitUrl, roomId } = useBroadcastChannel(channelId);
  const e2eeData = useE2EE(roomId);
  const room = useRoom({ e2eeData, audioInputEnabled: false, videoInputEnabled: false });

  if (room === undefined || mediaType === undefined || participantId === undefined) {
    return <CircularProgress />;
  }

  return (
    <RoomContainer room={room} token={accessToken} serverUrl={livekitUrl} video={false} audio={false}>
      <Video mediaDescriptor={{ mediaType, participantId }} room={room} />
    </RoomContainer>
  );
};

export default ExtendedTabPage;
