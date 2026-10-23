// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useRemoteParticipants } from '@livekit/components-react';
import { RemoteParticipant, RoomEvent } from 'livekit-client';

import { selectAllOnlineParticipants } from '../store/slices/participantsSlice';
import { selectCinemaViewOrder } from '../store/slices/uiSlice';
import { Participant, TileIdentifier } from '../types';
import { constructConnectionIdentifier } from '../utils/constructConnectionIdentifier';
import { sortCinemaViewParticipants } from '../utils/sortCinemaViewParticipants';
import { useAppSelector } from './useCustomRedux';
import { useFeaturedTile } from './useFeaturedTile';

export type CinemaViewParticipant = Participant & {
  audioLevel: number;
  isCameraEnabled: boolean;
  isScreenShareEnabled: boolean;
  isSpeaking: boolean;
  lastSpokeAt?: Date;
};

/**
 * Merges participant data from controller with livekit participant data and sorts it
 * according to the selected cinema view sort order
 * @returns Sorted list of merged participants and the featured tile
 */
export function useCinemaViewParticipants(): {
  cinemaViewParticipants: CinemaViewParticipant[];
  remoteParticipantsMap: Map<string, RemoteParticipant>;
  featuredTile: TileIdentifier | undefined;
} {
  const remoteParticipants = useRemoteParticipants({
    updateOnlyOn: [
      RoomEvent.ParticipantConnected,
      RoomEvent.ParticipantDisconnected,
      RoomEvent.TrackPublished,
      RoomEvent.TrackUnpublished,
      RoomEvent.TrackMuted,
      RoomEvent.TrackUnmuted,
      RoomEvent.ActiveSpeakersChanged,
    ],
  });
  const { featuredTile, sustainedActivity } = useFeaturedTile();
  const onlineParticipants = useAppSelector(selectAllOnlineParticipants);
  const viewOrder = useAppSelector(selectCinemaViewOrder);

  const remoteParticipantsMap = new Map(
    remoteParticipants.map((remoteParticipant) => [remoteParticipant.identity, remoteParticipant])
  );
  const mergedParticipants = onlineParticipants.flatMap((onlineParticipant) => {
    return onlineParticipant.connections.map((connectionId) => {
      const combinedId = constructConnectionIdentifier(onlineParticipant.id, connectionId);
      const remoteParticipant = remoteParticipantsMap.get(combinedId);

      return {
        ...onlineParticipant,
        connections: [connectionId],
        audioLevel: remoteParticipant?.audioLevel ?? 0,
        isCameraEnabled: remoteParticipant?.isCameraEnabled ?? false,
        isScreenShareEnabled: remoteParticipant?.isScreenShareEnabled ?? false,
        isSpeaking: remoteParticipant?.isSpeaking ?? false,
        lastSpokeAt: sustainedActivity.get(combinedId),
      };
    });
  });
  const cinemaViewParticipants = sortCinemaViewParticipants(mergedParticipants, viewOrder);

  return { cinemaViewParticipants, remoteParticipantsMap, featuredTile };
}
