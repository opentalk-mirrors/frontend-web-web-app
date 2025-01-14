// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { LiveKitRoom } from '@livekit/components-react';
import { CircularProgress, styled } from '@mui/material';
import { RoomId } from '@opentalk/rest-api-rtk-query';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { useAppDispatch } from '../../hooks';
import useE2EE from '../../hooks/useE2EE';
import useRoom from '../../hooks/useRoom';
import { setAudioAndVideoEnabled } from '../../store/slices/mediaSlice';
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
  const e2eeData = useE2EE(roomId as RoomId);
  const room = useRoom({ e2eeData });
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setAudioAndVideoEnabled({ audio: false, video: false }));
  }, []);

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
