// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useRemoteParticipants } from '@livekit/components-react';
import { RemoteParticipant, RoomEvent } from 'livekit-client';
import { useMemo } from 'react';

import { CinemaViewSortOrder } from '../store/slices/common';
import { selectAllOnlineParticipants } from '../store/slices/participantsSlice';
import { selectCinemaViewOrder } from '../store/slices/uiSlice';
import { Participant, ParticipationKind, Role } from '../types';
import { useAppSelector } from './useCustomRedux';

export type CinemaViewParticipant = Participant & {
  audioLevel: number;
  isCameraEnabled: boolean;
  isSpeaking: boolean;
  lastSpokeAt?: Date;
};

const ROLE_SORT_MAP: Record<Role, number> = { [Role.Moderator]: 0, [Role.User]: 1 };
const PARTICIPATION_SORT_MAP: Partial<Record<ParticipationKind, number>> = {
  [ParticipationKind.Registered]: 0,
  [ParticipationKind.Guest]: 1,
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

  const onlineParticipants = useAppSelector(selectAllOnlineParticipants);
  const remoteParticipantsMap = useMemo(
    () => new Map(remoteParticipants.map((rp) => [rp.identity, rp])),
    [remoteParticipants]
  );

  const viewOrder = useAppSelector(selectCinemaViewOrder);

  const cinemaViewParticipants = useMemo(() => {
    const mergedParticipants = onlineParticipants.map((op) => {
      const remoteParticipant = remoteParticipantsMap.get(op.id);
      return {
        ...op,
        audioLevel: remoteParticipant?.audioLevel ?? 0,
        isCameraEnabled: remoteParticipant?.isCameraEnabled ?? false,
        isSpeaking: remoteParticipant?.isSpeaking ?? false,
        lastSpokeAt: remoteParticipant?.lastSpokeAt,
      };
    });
    return mergedParticipants.sort((a, b) => {
      if (viewOrder === CinemaViewSortOrder.ModeratorsFirst) {
        const aRole = a.role ?? Role.User;
        const bRole = b.role ?? Role.User;
        const roleDelta = ROLE_SORT_MAP[aRole] - ROLE_SORT_MAP[bRole];
        if (roleDelta !== 0) {
          return roleDelta;
        }

        // Within Role.User, prioritize Registered over Guest
        if (aRole === Role.User && bRole === Role.User) {
          const aPart = PARTICIPATION_SORT_MAP[a.participationKind] ?? 1;
          const bPart = PARTICIPATION_SORT_MAP[b.participationKind] ?? 1;
          const partDelta = aPart - bPart;
          if (partDelta !== 0) {
            return partDelta;
          }
        }
      } else if (viewOrder === CinemaViewSortOrder.VideoFirst) {
        if (a.isCameraEnabled !== b.isCameraEnabled) {
          return a.isCameraEnabled ? -1 : 1;
        }
      }

      return a.joinedAt.localeCompare(b.joinedAt);
    });
  }, [onlineParticipants, remoteParticipantsMap, viewOrder]);

  return { cinemaViewParticipants, remoteParticipantsMap };
}
