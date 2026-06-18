// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useRemoteParticipants, useSortedParticipants } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';
import { useMemo } from 'react';

import { selectPinnedConnectionIdentifier } from '../store/slices/uiSlice';
import { ConnectionIdentifier } from '../types';
import { useAppSelector } from './useCustomRedux';
import { useThresholdSpeaker } from './useThresholdSpeaker';

export function useCurrentSpeaker(): {
  currentSpeakerId: ConnectionIdentifier | undefined;
  sustainedActivity: ReadonlyMap<string, Date>;
} {
  const remoteParticipants = useRemoteParticipants({
    updateOnlyOn: [RoomEvent.ParticipantConnected, RoomEvent.ParticipantDisconnected, RoomEvent.ActiveSpeakersChanged],
  });
  const sortedParticipants = useSortedParticipants(remoteParticipants);
  const pinnedConnectionIdentifier = useAppSelector(selectPinnedConnectionIdentifier);

  const speakerId = pinnedConnectionIdentifier || (sortedParticipants[0]?.identity as ConnectionIdentifier);
  const speakerLastSpokeAt = speakerId
    ? sortedParticipants.find((participant) => participant.identity === speakerId)?.lastSpokeAt
    : undefined;

  const participantIds = useMemo(
    () => new Set(remoteParticipants.map((participant) => participant.identity as ConnectionIdentifier)),
    [remoteParticipants]
  );

  const { stableSpeakerId, sustainedActivity } = useThresholdSpeaker({
    speakerId,
    isPinned: Boolean(pinnedConnectionIdentifier),
    participantIds,
    speakerLastSpokeAt,
  });

  return { currentSpeakerId: (stableSpeakerId as ConnectionIdentifier) ?? undefined, sustainedActivity };
}
