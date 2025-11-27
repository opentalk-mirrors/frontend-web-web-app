// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useRemoteParticipants } from '@livekit/components-react';

import { MAX_GRID_TILES_DESKTOP, MAX_GRID_TILES_MOBILE } from '../constants';
import { GridViewOrder } from '../store/slices/common';
import { selectAllOnlineParticipants } from '../store/slices/participantsSlice';
import { selectGridViewOrder, selectPaginationPageState } from '../store/slices/uiSlice';
import { Participant, Role } from '../types';
import { useAppSelector } from './useCustomRedux';
import { useIsMobile } from './useMediaQuery';

type GridParticipant = Participant & {
  audioLevel: number;
  isCameraEnabled: boolean;
  isSpeaking: boolean;
  lastSpokeAt?: Date;
};

export function useGridViewParticipants() {
  const remoteParticipants = useRemoteParticipants();
  const onlineParticipantsInConference = useAppSelector(selectAllOnlineParticipants);
  const remoteParticipantMap = new Map(remoteParticipants.map((rp) => [rp.identity, rp]));
  const mergedParticipants: GridParticipant[] = onlineParticipantsInConference.map((op) => {
    const remoteParticipant = remoteParticipantMap.get(op.id);
    return {
      ...op,
      audioLevel: remoteParticipant?.audioLevel ?? 0,
      isCameraEnabled: remoteParticipant?.isCameraEnabled ?? false,
      isSpeaking: remoteParticipant?.isSpeaking ?? false,
      lastSpokeAt: remoteParticipant?.lastSpokeAt,
    };
  });

  mergedParticipants.sort((a, b) => a.joinedAt.localeCompare(b.joinedAt));

  const gridViewOrder = useAppSelector(selectGridViewOrder);
  if (gridViewOrder === GridViewOrder.ModeratorsFirst) {
    mergedParticipants.sort((ap, bp) => Number(ap.role === Role.Moderator) - Number(bp.role === Role.Moderator));
  }
  if (gridViewOrder === GridViewOrder.VideoFirst) {
    mergedParticipants.sort((a, b) => (a.isCameraEnabled === b.isCameraEnabled ? 0 : a.isCameraEnabled ? -1 : 1));
  }

  const isMobile = useIsMobile();
  const MAX_GRID_TILES = isMobile ? MAX_GRID_TILES_MOBILE : MAX_GRID_TILES_DESKTOP;
  const currentPage = useAppSelector(selectPaginationPageState);

  let lastSpokenParticipant: GridParticipant | undefined;
  for (const participant of mergedParticipants) {
    if (!participant.lastSpokeAt) {
      continue;
    }
    if (
      !lastSpokenParticipant ||
      !lastSpokenParticipant.lastSpokeAt ||
      participant.lastSpokeAt.getTime() > lastSpokenParticipant.lastSpokeAt.getTime()
    ) {
      lastSpokenParticipant = participant;
    }
  }

  if (!lastSpokenParticipant) {
    return mergedParticipants.slice((currentPage - 1) * MAX_GRID_TILES, currentPage * MAX_GRID_TILES);
  }

  // I need to place last spoken participant on the first page if not already present
  // specifically on the last spot of the first page, pushing everyone else forward
  const firstPageLastSpotIndex = MAX_GRID_TILES - 1;
  const lastSpokenParticipantIndex = mergedParticipants.findIndex((p) => p.id === lastSpokenParticipant!.id);
  if (lastSpokenParticipantIndex >= 0 && lastSpokenParticipantIndex < MAX_GRID_TILES) {
    // already on the first page
    return mergedParticipants.slice((currentPage - 1) * MAX_GRID_TILES, currentPage * MAX_GRID_TILES);
  }

  const participantsWithoutLastSpoken = mergedParticipants.filter((p) => p.id !== lastSpokenParticipant.id);
  return [
    ...participantsWithoutLastSpoken.slice(0, firstPageLastSpotIndex),
    lastSpokenParticipant,
    ...participantsWithoutLastSpoken.slice(firstPageLastSpotIndex),
  ].slice((currentPage - 1) * MAX_GRID_TILES, currentPage * MAX_GRID_TILES);
}
