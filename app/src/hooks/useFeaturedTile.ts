// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useRemoteParticipants, useSortedParticipants } from '@livekit/components-react';
import { RoomEvent, Track } from 'livekit-client';
import { useMemo } from 'react';

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
export function useFeaturedTile(): {
  featuredTile: TileIdentifier | undefined;
  sustainedActivity: ReadonlyMap<string, Date>;
} {
  const remoteParticipants = useRemoteParticipants({
    updateOnlyOn: [RoomEvent.ParticipantConnected, RoomEvent.ParticipantDisconnected, RoomEvent.ActiveSpeakersChanged],
  });
  const sortedParticipants = useSortedParticipants(remoteParticipants);
  const pinnedTile = useAppSelector(selectPinnedTile);

  const speakerId = pinnedTile?.connectionIdentifier || (sortedParticipants[0]?.identity as ConnectionIdentifier);
  const speakerLastSpokeAt = speakerId
    ? sortedParticipants.find((participant) => participant.identity === speakerId)?.lastSpokeAt
    : undefined;

  const participantIds = useMemo(
    () => new Set(remoteParticipants.map((participant) => participant.identity as ConnectionIdentifier)),
    [remoteParticipants]
  );

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
