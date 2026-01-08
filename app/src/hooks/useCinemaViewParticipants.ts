// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useRemoteParticipants } from '@livekit/components-react';
import { RemoteParticipant, RoomEvent } from 'livekit-client';
import { useMemo } from 'react';

import { CinemaViewSortOrder } from '../store/slices/common';
import { selectAllOnlineParticipants } from '../store/slices/participantsSlice';
import { selectCinemaViewOrder } from '../store/slices/uiSlice';
import { Participant, Role } from '../types';
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
} {
  const remoteParticipants = useRemoteParticipants({
    updateOnlyOn: [
      RoomEvent.ParticipantConnected,
      RoomEvent.ParticipantDisconnected,
      RoomEvent.TrackPublished,
      RoomEvent.TrackUnpublished,
      RoomEvent.TrackMuted,
      RoomEvent.TrackUnmuted,
    ],
  });

  const onlineParticipantsInConference = useAppSelector(selectAllOnlineParticipants);
  const remoteParticipantsMap = useMemo(
    () => new Map(remoteParticipants.map((rp) => [rp.identity, rp])),
    [remoteParticipants]
  );
  const viewOrder = useAppSelector(selectCinemaViewOrder);
  const cinemaViewParticipants = useMemo(() => {
    const mergedParticipants = onlineParticipantsInConference.map((op) => {
      const remoteParticipant = remoteParticipantsMap.get(op.id);
      return {
        ...op,
        audioLevel: remoteParticipant?.audioLevel ?? 0,
        isCameraEnabled: remoteParticipant?.isCameraEnabled ?? false,
        isSpeaking: remoteParticipant?.isSpeaking ?? false,
        lastSpokeAt: remoteParticipant?.lastSpokeAt,
      };
    });
    mergedParticipants.sort((a, b) => a.joinedAt.localeCompare(b.joinedAt));

    if (viewOrder === CinemaViewSortOrder.ModeratorsFirst) {
      mergedParticipants.sort((ap, bp) => Number(ap.role === Role.Moderator) - Number(bp.role === Role.Moderator));
    }
    if (viewOrder === CinemaViewSortOrder.VideoFirst) {
      mergedParticipants.sort((a, b) => (a.isCameraEnabled === b.isCameraEnabled ? 0 : a.isCameraEnabled ? -1 : 1));
    }
    return mergedParticipants;
  }, [onlineParticipantsInConference, remoteParticipantsMap, viewOrder]);

  return { cinemaViewParticipants, remoteParticipantsMap };
}
