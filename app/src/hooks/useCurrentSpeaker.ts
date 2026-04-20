// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useRemoteParticipants, useSortedParticipants } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';

import { selectPinnedConnectionIdentifier } from '../store/slices/uiSlice';
import { useAppSelector } from './useCustomRedux';

export function useCurrentSpeaker() {
  const remoteParticipants = useRemoteParticipants({
    updateOnlyOn: [RoomEvent.ParticipantConnected, RoomEvent.ParticipantDisconnected, RoomEvent.ActiveSpeakersChanged],
  });
  const sortedParticipants = useSortedParticipants(remoteParticipants);
  const pinnedConnectionIdentifier = useAppSelector(selectPinnedConnectionIdentifier);

  return pinnedConnectionIdentifier || sortedParticipants[0]?.identity;
}
