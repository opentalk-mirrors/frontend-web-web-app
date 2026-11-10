// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useSortedParticipants } from '@livekit/components-react';
import { Participant, Track } from 'livekit-client';

import { selectPinnedTile } from '../store/slices/uiSlice';
import { ConnectionIdentifier, TileIdentifier } from '../types';
import { useAppSelector } from './useCustomRedux';
import { useThresholdSpeaker } from './useThresholdSpeaker';

/**
 * Selects the tile featured in the speaker window.
 *
 * A featured tile is: a pinned tile (pinned manually by a user or automatically, if remote participant has shared screen).
 * If no tile is pinned - the camera tile of the active speaker.
 * Note: A screen share tile is only featured when pinned
 */
export function useFeaturedTile(
  remoteParticipants: Participant[],
  participantIds: ReadonlySet<ConnectionIdentifier>
): {
  featuredTile: TileIdentifier | undefined;
  sustainedActivity: ReadonlyMap<string, Date>;
} {
  const pinnedTile = useAppSelector(selectPinnedTile);

  const sortedParticipants = useSortedParticipants(remoteParticipants).filter((participant) =>
    participantIds.has(participant.identity as ConnectionIdentifier)
  );

  const speakerId = pinnedTile?.connectionIdentifier || (sortedParticipants[0]?.identity as ConnectionIdentifier);
  const speakerLastSpokeAt = speakerId
    ? sortedParticipants.find((participant) => participant.identity === speakerId)?.lastSpokeAt
    : undefined;

  const { stableSpeakerId, sustainedActivity } = useThresholdSpeaker({
    speakerId,
    isPinned: Boolean(pinnedTile),
    participantIds,
    speakerLastSpokeAt,
  });

  const featuredTile: TileIdentifier | undefined = stableSpeakerId
    ? {
        connectionIdentifier: stableSpeakerId,
        source: pinnedTile?.connectionIdentifier === stableSpeakerId ? pinnedTile.source : Track.Source.Camera,
      }
    : undefined;

  return { featuredTile, sustainedActivity };
}
