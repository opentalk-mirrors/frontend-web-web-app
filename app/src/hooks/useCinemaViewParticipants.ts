// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useRemoteParticipants, useSortedParticipants } from '@livekit/components-react';
import { RemoteParticipant, RoomEvent } from 'livekit-client';
import { useMemo } from 'react';

import { selectAllOnlineParticipants } from '../store/slices/participantsSlice';
import { selectCinemaViewOrder, selectPinnedConnectionIdentifier } from '../store/slices/uiSlice';
import { Participant } from '../types';
import { constructConnectionIdentifier } from '../utils/constructConnectionIdentifier';
import { sortCinemaViewParticipants } from '../utils/sortCinemaViewParticipants';
import { useAppSelector } from './useCustomRedux';

export type CinemaViewParticipant = Participant & {
  audioLevel: number;
  isCameraEnabled: boolean;
  isSpeaking: boolean;
  lastSpokeAt?: Date;
};

/**
 * Merges participant data from controller with livekit participant data and sorts it
 * according to the selected cinema view sort order
 * @returns Sorted list of merged participants
 */
export function useCinemaViewParticipants(): {
  cinemaViewParticipants: CinemaViewParticipant[];
  remoteParticipantsMap: Map<string, RemoteParticipant>;
  currentSpeakerId?: string;
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
  const sortedParticipants = useSortedParticipants(remoteParticipants);
  const pinnedConnectionIdentifier = useAppSelector(selectPinnedConnectionIdentifier);
  const currentSpeakerId = pinnedConnectionIdentifier || sortedParticipants[0]?.identity;

  const onlineParticipants = useAppSelector(selectAllOnlineParticipants);
  const remoteParticipantsMap = useMemo(
    () => new Map(remoteParticipants.map((rp) => [rp.identity, rp])),
    [remoteParticipants]
  );

  const viewOrder = useAppSelector(selectCinemaViewOrder);

  const cinemaViewParticipants = useMemo(() => {
    const mergedParticipants = onlineParticipants.flatMap((op) => {
      return op.connections.map((connectionId) => {
        const combinedId = constructConnectionIdentifier(op.id, connectionId);
        const remoteParticipant = remoteParticipantsMap.get(combinedId);

        return {
          ...op,
          connections: [connectionId],
          audioLevel: remoteParticipant?.audioLevel ?? 0,
          isCameraEnabled: remoteParticipant?.isCameraEnabled ?? false,
          isSpeaking: remoteParticipant?.isSpeaking ?? false,
          lastSpokeAt: remoteParticipant?.lastSpokeAt,
        };
      });
    });

    return sortCinemaViewParticipants(mergedParticipants, viewOrder);
  }, [onlineParticipants, remoteParticipantsMap, viewOrder]);

  return { cinemaViewParticipants, remoteParticipantsMap, currentSpeakerId };
}
