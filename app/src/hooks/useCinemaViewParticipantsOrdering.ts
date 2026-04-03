// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';

import { MAX_GRID_TILES_DESKTOP, MAX_GRID_TILES_MOBILE } from '../constants';
import {
  selectActiveSpeakerFirstEnabled,
  selectCinemaGridSize,
  selectCinemaViewOrder,
  selectPaginationPageState,
} from '../store/slices/uiSlice';
import { ConnectionId, ConnectionIdentifier, ParticipantId } from '../types';
import { constructConnectionIdentifier } from '../utils/constructConnectionIdentifier';
import { useCurrentSpeaker } from './useCurrentSpeaker';
import { useAppSelector } from './useCustomRedux';
import { useIsMobile } from './useMediaQuery';

type CinemaViewParticipantForOrdering = {
  id: ParticipantId;
  connections: ConnectionId[];
  lastSpokeAt?: Date;
};

type PersistedOrderingState = {
  orderedKeys: ConnectionIdentifier[];
  sortOrder: unknown;
};

type ParticipantsIndexingResult<T extends CinemaViewParticipantForOrdering> = {
  participantKeys: ConnectionIdentifier[];
  participantsByKey: Map<ConnectionIdentifier, T>;
};

const persistedOrderByHookInstance = new Map<string, PersistedOrderingState>();
let hookInstanceCounter = 0;

const getParticipantKey = <T extends CinemaViewParticipantForOrdering>(participant: T): ConnectionIdentifier | null => {
  const [connectionId] = participant.connections;
  if (!connectionId) {
    return null;
  }
  return constructConnectionIdentifier(participant.id, connectionId);
};

const reconcileOrder = (
  currentOrder: ConnectionIdentifier[],
  incomingKeys: ConnectionIdentifier[]
): ConnectionIdentifier[] => {
  const incomingSet = new Set(incomingKeys);
  const keptKeys = currentOrder.filter((key) => incomingSet.has(key));
  const keptKeysSet = new Set(keptKeys);
  const addedKeys = incomingKeys.filter((key) => !keptKeysSet.has(key));
  return [...keptKeys, ...addedKeys];
};

const mapKeysToParticipants = <T extends CinemaViewParticipantForOrdering>(
  orderedKeys: ConnectionIdentifier[],
  participantsByKey: Map<ConnectionIdentifier, T>
): T[] => {
  const mappedParticipants: T[] = [];

  for (const key of orderedKeys) {
    const participant = participantsByKey.get(key);
    if (!participant) {
      continue;
    }
    mappedParticipants.push(participant);
  }

  return mappedParticipants;
};

const indexParticipantsForOrdering = <T extends CinemaViewParticipantForOrdering>(
  participants: T[]
): ParticipantsIndexingResult<T> => {
  const participantKeys: ConnectionIdentifier[] = [];
  const participantsByKey = new Map<ConnectionIdentifier, T>();

  for (const participant of participants) {
    const key = getParticipantKey(participant);
    if (!key) {
      continue;
    }

    participantKeys.push(key);
    participantsByKey.set(key, participant);
  }

  return {
    participantKeys,
    participantsByKey,
  };
};

/**
 *
 * @param participants - Pre sorted participants.
 */
export function useCinemaViewParticipantsOrdering<T extends CinemaViewParticipantForOrdering>(participants: T[]) {
  const [hookInstanceId] = useState(() => `useCinemaViewParticipantsOrdering-${hookInstanceCounter++}`);
  const activeSpeakerFirstEnabled = useAppSelector(selectActiveSpeakerFirstEnabled);
  const { participantKeys, participantsByKey } = useMemo(
    () => indexParticipantsForOrdering(participants),
    [participants]
  );
  const currentSpeaker = useCurrentSpeaker();

  const currentPage = useAppSelector(selectPaginationPageState);
  const selectedGridSize = useAppSelector(selectCinemaGridSize);
  const isMobile = useIsMobile();
  const maxGridTiles = isMobile
    ? Math.min(selectedGridSize, MAX_GRID_TILES_MOBILE)
    : Math.min(selectedGridSize, MAX_GRID_TILES_DESKTOP);

  const cinemaViewOrder = useAppSelector(selectCinemaViewOrder);
  const currentPageIndex = Math.max(currentPage - 1, 0);

  useEffect(() => {
    return () => {
      persistedOrderByHookInstance.delete(hookInstanceId);
    };
  }, [hookInstanceId]);

  const orderedKeys = useMemo(() => {
    const persistedState = persistedOrderByHookInstance.get(hookInstanceId);
    const isSortOrderChanged = persistedState?.sortOrder !== cinemaViewOrder;

    const nextOrder =
      persistedState && !isSortOrderChanged
        ? reconcileOrder(persistedState.orderedKeys, participantKeys)
        : participantKeys;

    if (!currentSpeaker) {
      return nextOrder;
    }

    const currentSpeakerIndex = nextOrder.indexOf(currentSpeaker);

    if (
      currentSpeakerIndex === -1 ||
      currentSpeakerIndex < maxGridTiles ||
      currentPageIndex !== 0 ||
      !activeSpeakerFirstEnabled
    ) {
      return nextOrder;
    }

    let leastActiveParticipantIndex: number = -1;
    const firstPageLimit = Math.min(nextOrder.length, maxGridTiles);
    for (let i = 0; i < firstPageLimit; i++) {
      const participantKey = nextOrder[i];
      const participant = participantKey ? participantsByKey.get(participantKey) : undefined;
      if (!participant) {
        continue;
      }

      if (!participant.lastSpokeAt) {
        leastActiveParticipantIndex = i;
        break;
      }

      if (leastActiveParticipantIndex === -1) {
        leastActiveParticipantIndex = i;
      }

      const leastActiveParticipantKey = nextOrder[leastActiveParticipantIndex];
      const leastActiveParticipant = leastActiveParticipantKey
        ? participantsByKey.get(leastActiveParticipantKey)
        : undefined;

      const bothParticipantsSpoke = participant.lastSpokeAt && leastActiveParticipant?.lastSpokeAt;
      if (
        bothParticipantsSpoke &&
        leastActiveParticipant.lastSpokeAt &&
        participant.lastSpokeAt < leastActiveParticipant.lastSpokeAt
      ) {
        leastActiveParticipantIndex = i;
      }
    }

    if (leastActiveParticipantIndex === -1) {
      return nextOrder;
    }

    const swappedOrder = [...nextOrder];
    [swappedOrder[leastActiveParticipantIndex], swappedOrder[currentSpeakerIndex]] = [
      swappedOrder[currentSpeakerIndex],
      swappedOrder[leastActiveParticipantIndex],
    ];

    return swappedOrder;
  }, [
    participantKeys,
    participantsByKey,
    hookInstanceId,
    cinemaViewOrder,
    currentSpeaker,
    maxGridTiles,
    currentPageIndex,
    activeSpeakerFirstEnabled,
  ]);

  useLayoutEffect(() => {
    persistedOrderByHookInstance.set(hookInstanceId, {
      orderedKeys,
      sortOrder: cinemaViewOrder,
    });
  }, [hookInstanceId, orderedKeys, cinemaViewOrder]);

  const pageStartIndex = currentPageIndex * maxGridTiles;
  const pageEndIndex = (currentPageIndex + 1) * maxGridTiles;
  const pageKeys = orderedKeys.slice(pageStartIndex, pageEndIndex);

  return mapKeysToParticipants(pageKeys, participantsByKey);
}
