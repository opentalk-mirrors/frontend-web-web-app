// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useRemoteParticipants, useSortedParticipants } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';

import { selectPinnedParticipantId } from '../store/slices/uiSlice';
import { useAppSelector } from './useCustomRedux';

export function useCurrentSpeaker() {
  const sortedParticipants = useSortedParticipants(
    useRemoteParticipants({
      updateOnlyOn: [
        RoomEvent.ParticipantConnected,
        RoomEvent.ParticipantDisconnected,
        RoomEvent.ActiveSpeakersChanged,
      ],
    })
  );
  const pinnedParticipantId = useAppSelector(selectPinnedParticipantId);

  return pinnedParticipantId || sortedParticipants[0]?.identity;
}
