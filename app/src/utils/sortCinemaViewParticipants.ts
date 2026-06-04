// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { CinemaViewParticipant } from '../hooks/useCinemaViewParticipants';
import { CinemaViewSortOrder } from '../store/slices/common';
import { ParticipationKind, Role } from '../types';

export type SortableCinemaViewParticipant = Pick<
  CinemaViewParticipant,
  'isCameraEnabled' | 'role' | 'joinedAt' | 'isSpeaking' | 'lastSpokeAt' | 'participationKind'
>;

export function sortCinemaViewParticipants<T extends SortableCinemaViewParticipant>(
  participants: T[],
  order: CinemaViewSortOrder
): T[] {
  // `ActivityFirst` uses `VideoFirst` as the base ordering
  if (order === CinemaViewSortOrder.VideoFirst || order === CinemaViewSortOrder.ActivityFirst) {
    return [...participants].sort((a, b) => {
      if (a.isCameraEnabled !== b.isCameraEnabled) {
        return a.isCameraEnabled ? -1 : 1;
      }
      return a.joinedAt.localeCompare(b.joinedAt);
    });
  }

  if (order === CinemaViewSortOrder.FirstJoined) {
    return [...participants].sort((a, b) => {
      if (a.joinedAt === b.joinedAt) {
        return 0;
      }
      return a.joinedAt.localeCompare(b.joinedAt);
    });
  }

  if (order === CinemaViewSortOrder.ModeratorsFirst) {
    return [...participants].sort((a, b) => {
      const aRole = a.role ?? Role.User;
      const bRole = b.role ?? Role.User;
      if (aRole === Role.Moderator && bRole === Role.Moderator) {
        return a.joinedAt.localeCompare(b.joinedAt);
      }
      if (aRole === Role.Moderator) {
        return -1;
      }
      if (bRole === Role.Moderator) {
        return 1;
      }
      // If both participants have the same role, prioritize registered users over guests.
      if (aRole === Role.User && bRole === Role.User) {
        const aPart = a.participationKind ?? ParticipationKind.Guest;
        const bPart = b.participationKind ?? ParticipationKind.Guest;
        if (aPart === ParticipationKind.Registered && bPart !== ParticipationKind.Registered) {
          return -1;
        }
        if (bPart === ParticipationKind.Registered && aPart !== ParticipationKind.Registered) {
          return 1;
        }
        return a.joinedAt.localeCompare(b.joinedAt);
      }
      return a.joinedAt.localeCompare(b.joinedAt);
    });
  }

  return participants;
}
