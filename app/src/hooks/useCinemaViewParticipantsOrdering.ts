// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';

import { MAX_GRID_TILES_DESKTOP, MAX_GRID_TILES_MOBILE } from '../constants';
import { CinemaViewSortOrder } from '../store/slices/common';
import { selectCinemaGridSize, selectCinemaViewOrder, selectPaginationPageState } from '../store/slices/uiSlice';
import { ConnectionId, ConnectionIdentifier, ParticipantId } from '../types';
import { constructConnectionIdentifier } from '../utils/constructConnectionIdentifier';
import { useCurrentSpeaker } from './useCurrentSpeaker';
import { useAppSelector } from './useCustomRedux';
import { useIsMobile } from './useMediaQuery';

type CinemaViewParticipantForOrdering = {
  id: ParticipantId;
  connections: ConnectionId[];
  joinedAt: string;
  lastSpokeAt?: Date;
  isCameraEnabled?: boolean;
};

/**
 * Compute a "last activity" timestamp for a participant. Smaller values mean the
 * participant has been inactive for longer and is therefore a better displacement
 * target
 */
const getInactivityScore = (
  participant: CinemaViewParticipantForOrdering,
  cameraActivationAt: number | undefined
): number => {
  const joinedAtMs = new Date(participant.joinedAt).getTime();
  return Math.max(
    Number.isFinite(joinedAtMs) ? joinedAtMs : Number.NEGATIVE_INFINITY,
    participant.lastSpokeAt?.getTime() ?? Number.NEGATIVE_INFINITY,
    cameraActivationAt ?? Number.NEGATIVE_INFINITY
  );
};

type PersistedOrderingState = {
  orderedKeys: ConnectionIdentifier[];
  sortOrder: unknown;
  cameraActivationAt: Map<ConnectionIdentifier, number>;
};

type ParticipantsIndexingResult<T extends CinemaViewParticipantForOrdering> = {
  participantKeys: ConnectionIdentifier[];
  participantsByKey: Map<ConnectionIdentifier, T>;
};

const persistedOrderByHookInstance = new Map<string, PersistedOrderingState>();
let hookInstanceCounter = 0;

const readNow = (): number => Date.now();

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

const computeCameraActivationAt = <T extends CinemaViewParticipantForOrdering>(
  participantKeys: ConnectionIdentifier[],
  participantsByKey: Map<ConnectionIdentifier, T>,
  previous: Map<ConnectionIdentifier, number> | undefined,
  now: number
): Map<ConnectionIdentifier, number> => {
  const cameraActivationAt = new Map<ConnectionIdentifier, number>();
  for (const key of participantKeys) {
    if (!participantsByKey.get(key)?.isCameraEnabled) {
      continue;
    }
    cameraActivationAt.set(key, previous?.get(key) ?? now);
  }
  return cameraActivationAt;
};

// SpeakerView strip ordering: sort by most-recent activity first
const orderStripByActivity = <T extends CinemaViewParticipantForOrdering>(
  order: ConnectionIdentifier[],
  participantsByKey: Map<ConnectionIdentifier, T>,
  cameraActivationAt: Map<ConnectionIdentifier, number>
): ConnectionIdentifier[] => {
  const activityAt = (key: ConnectionIdentifier): number =>
    Math.max(
      participantsByKey.get(key)?.lastSpokeAt?.getTime() ?? Number.NEGATIVE_INFINITY,
      cameraActivationAt.get(key) ?? Number.NEGATIVE_INFINITY
    );

  return order
    .map((key, index) => ({ key, index, activity: activityAt(key) }))
    .sort((a, b) => b.activity - a.activity || a.index - b.index)
    .map((entry) => entry.key);
};

// Cinema-grid ordering: keep the grid tiles stable by only swapping participants
// onto the first page instead of re-sorting everything
const orderGridByPriority = <T extends CinemaViewParticipantForOrdering>(
  order: ConnectionIdentifier[],
  participantsByKey: Map<ConnectionIdentifier, T>,
  cameraActivationAt: Map<ConnectionIdentifier, number>,
  currentSpeaker: ConnectionIdentifier | null | undefined,
  maxGridTiles: number
): ConnectionIdentifier[] => {
  const firstPageLimit = Math.min(order.length, maxGridTiles);
  const scoreOf = (key: ConnectionIdentifier): number => {
    const participant = participantsByKey.get(key);
    return participant ? getInactivityScore(participant, cameraActivationAt.get(key)) : Number.POSITIVE_INFINITY;
  };

  // Index of the page-1 slot with the smallest score (= longest inactive)
  const longestInactivePageOneSlot = (current: ConnectionIdentifier[]): { index: number | null; score: number } => {
    let index: number | null = null;
    let bestScore = Number.POSITIVE_INFINITY;
    for (let i = 0; i < firstPageLimit; i++) {
      const key = current[i];
      if (key === currentSpeaker || !participantsByKey.has(key)) {
        continue;
      }
      const score = scoreOf(key);
      if (score < bestScore) {
        bestScore = score;
        index = i;
      }
    }
    return { index, score: bestScore };
  };

  const swap = (current: ConnectionIdentifier[], i: number, j: number): ConnectionIdentifier[] => {
    const next = [...current];
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  };

  let workingOrder = order;

  // Pass 1: force the current speaker onto page 1
  const speaker = currentSpeaker ? participantsByKey.get(currentSpeaker) : undefined;
  if (currentSpeaker && (speaker?.lastSpokeAt || speaker?.isCameraEnabled)) {
    const speakerIndex = workingOrder.indexOf(currentSpeaker);
    if (speakerIndex >= firstPageLimit) {
      const { index } = longestInactivePageOneSlot(workingOrder);
      if (index !== null) {
        workingOrder = swap(workingOrder, index, speakerIndex);
      }
    }
  }

  // Pass 2: promote other active participants from later pages
  for (let i = firstPageLimit; i < workingOrder.length; i++) {
    const candidateKey = workingOrder[i];
    if (candidateKey === currentSpeaker) {
      continue;
    }
    const candidate = participantsByKey.get(candidateKey);
    if (!candidate?.isCameraEnabled && !candidate?.lastSpokeAt) {
      continue;
    }
    const { index, score } = longestInactivePageOneSlot(workingOrder);
    if (index === null || score >= scoreOf(candidateKey)) {
      continue;
    }
    workingOrder = swap(workingOrder, index, i);
  }

  return workingOrder;
};

export type CinemaViewParticipantsOrderingOptions = {
  // When true, ordering is computed for a single, scrollable strip (the
  // SpeakerView `ThumbsRow`) instead of the paginated cinema grid
  unbounded?: boolean;
};

/**
 *
 * @param participants - Pre sorted participants.
 * @param options - Optional behavior switches; see
 *   {@link CinemaViewParticipantsOrderingOptions}.
 */
export function useCinemaViewParticipantsOrdering<T extends CinemaViewParticipantForOrdering>(
  participants: T[],
  options?: CinemaViewParticipantsOrderingOptions
) {
  const unbounded = options?.unbounded === true;
  const [hookInstanceId] = useState(() => `useCinemaViewParticipantsOrdering-${hookInstanceCounter++}`);
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

  const { orderedKeys, cameraActivationAt } = useMemo(() => {
    const persistedState = persistedOrderByHookInstance.get(hookInstanceId);
    const isSortOrderChanged = persistedState?.sortOrder !== cinemaViewOrder;

    const nextOrder =
      persistedState && !isSortOrderChanged
        ? reconcileOrder(persistedState.orderedKeys, participantKeys)
        : participantKeys;

    const computedCameraActivationAt = computeCameraActivationAt(
      participantKeys,
      participantsByKey,
      persistedState?.cameraActivationAt,
      readNow()
    );

    const isActivityFirst = cinemaViewOrder === CinemaViewSortOrder.ActivityFirst;
    if (!isActivityFirst || (!unbounded && currentPageIndex !== 0)) {
      return { orderedKeys: nextOrder, cameraActivationAt: computedCameraActivationAt };
    }

    const reordered = unbounded
      ? orderStripByActivity(nextOrder, participantsByKey, computedCameraActivationAt)
      : orderGridByPriority(nextOrder, participantsByKey, computedCameraActivationAt, currentSpeaker, maxGridTiles);

    return { orderedKeys: reordered, cameraActivationAt: computedCameraActivationAt };
  }, [
    participantKeys,
    participantsByKey,
    hookInstanceId,
    cinemaViewOrder,
    currentSpeaker,
    maxGridTiles,
    currentPageIndex,
    unbounded,
  ]);

  useLayoutEffect(() => {
    persistedOrderByHookInstance.set(hookInstanceId, {
      orderedKeys,
      sortOrder: cinemaViewOrder,
      cameraActivationAt,
    });
  }, [hookInstanceId, orderedKeys, cinemaViewOrder, cameraActivationAt]);

  const pageStartIndex = currentPageIndex * maxGridTiles;
  const pageEndIndex = (currentPageIndex + 1) * maxGridTiles;
  const pageKeys = orderedKeys.slice(pageStartIndex, pageEndIndex);

  return {
    pageParticipants: mapKeysToParticipants(pageKeys, participantsByKey),
    orderedParticipants: mapKeysToParticipants(orderedKeys, participantsByKey),
  };
}
