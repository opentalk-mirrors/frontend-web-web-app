// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { RoomId } from '@opentalk/rest-api-rtk-query';
import { useEffect, useState } from 'react';

import { useAppDispatch } from '../../../hooks';
import { startBroadcastRoom } from '../../../store/slices/livekitSlice';
import { ConnectionIdentifier, MediaSessionType } from '../../../types';

type IUseBroadcastChannel = {
  accessToken?: string;
  mediaType?: MediaSessionType;
  connectionIdentifier?: ConnectionIdentifier;
  livekitUrl?: string;
  roomId?: RoomId;
};

const useBroadcastChannel = (channelId: string | undefined): IUseBroadcastChannel => {
  const [livekitData, setLivekitData] = useState<IUseBroadcastChannel>();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (channelId) {
      dispatch(
        startBroadcastRoom({
          accessToken: livekitData?.accessToken,
          connectionIdentifier: livekitData?.connectionIdentifier,
        })
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
  }, [channelId, dispatch, livekitData?.accessToken, livekitData?.connectionIdentifier]);

  return {
    accessToken: livekitData?.accessToken,
    mediaType: livekitData?.mediaType,
    connectionIdentifier: livekitData?.connectionIdentifier,
    livekitUrl: livekitData?.livekitUrl,
    roomId: livekitData?.roomId,
  };
};

export { useBroadcastChannel };
