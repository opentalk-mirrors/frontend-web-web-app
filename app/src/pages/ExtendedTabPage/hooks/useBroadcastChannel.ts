// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { RoomId } from '@opentalk/rest-api-rtk-query';
import { useEffect, useState } from 'react';

import { useAppDispatch } from '../../../hooks';
import { startBroadcastRoom } from '../../../store/slices/livekitSlice';
import { MediaSessionType, ParticipantId } from '../../../types';

type IUseBroadcastChannel = {
  accessToken?: string;
  mediaType?: MediaSessionType;
  participantId?: ParticipantId;
  livekitUrl?: string;
  roomId?: RoomId;
};

const useBroadcastChannel = (channelId: string | undefined): IUseBroadcastChannel => {
  const [livekitData, setLivekitData] = useState<IUseBroadcastChannel>();
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (channelId) {
      dispatch(
        startBroadcastRoom({ accessToken: livekitData?.accessToken, participantId: livekitData?.participantId })
      );
      const channel = new BroadcastChannel(channelId);
      channel.postMessage({ namespace: 'extended_tab', payload: { action: 'request_livekit_data' } });
      channel.onmessage = (event) => {
        if (event.data.namespace === 'extended_tab') {
          if (event.data.payload.action === 'livekit_data') {
            setLivekitData(event.data.payload);
          }
        }
      };
    }
  }, [channelId, dispatch, livekitData?.accessToken, livekitData?.participantId]);

  return {
    accessToken: livekitData?.accessToken,
    mediaType: livekitData?.mediaType,
    participantId: livekitData?.participantId,
    livekitUrl: livekitData?.livekitUrl,
    roomId: livekitData?.roomId,
  };
};

export { useBroadcastChannel };
