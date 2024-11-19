// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useEffect, useState } from 'react';

import { MediaSessionType, ParticipantId } from '../../../types';

type IUseBroadcastChannel = {
  accessToken?: string;
  mediaType?: MediaSessionType;
  participantId?: ParticipantId;
  livekitUrl?: string;
};

const useBroadcastChannel = (channelId: string | undefined): IUseBroadcastChannel => {
  const [livekitData, setLivekitData] = useState<IUseBroadcastChannel>();

  useEffect(() => {
    if (channelId) {
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
  }, []);

  return {
    accessToken: livekitData?.accessToken,
    mediaType: livekitData?.mediaType,
    participantId: livekitData?.participantId,
    livekitUrl: livekitData?.livekitUrl,
  };
};

export { useBroadcastChannel };
