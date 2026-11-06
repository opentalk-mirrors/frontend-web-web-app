// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Track } from 'livekit-client';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';

import { CinemaViewSortOrder } from '../store/slices/common';
import { selectCinemaViewOrder, selectPaginationPageState, selectPinnedTile } from '../store/slices/uiSlice';
import { ConnectionId, ConnectionIdentifier, MediaSessionType, ParticipantId } from '../types';
import { constructConnectionIdentifier } from '../utils/constructConnectionIdentifier';
import useConferenceUiVersion from './useConferenceUiVersion';
import { useAppSelector } from './useCustomRedux';
import { useGridPageSize } from './useGridPageSize';

type ParticipantForTiles = {
  id: ParticipantId;
  connections: ConnectionId[];
  joinedAt: string;
  lastSpokeAt?: Date;
  isSpeaking?: boolean;
  isCameraEnabled?: boolean;
  isScreenShareEnabled?: boolean;
};

export type CinemaViewTile<T extends ParticipantForTiles> = {
  participant: T;
  connectionIdentifier: ConnectionIdentifier;
  source: MediaSessionType;
  tileKey: string;
};

/**
 * Compute a "last activity" timestamp for a participant. Smaller values mean the
 * participant has been inactive for longer and is therefore a better displacement
 * target
 */
const getInactivityScore = (participant: ParticipantForTiles, cameraActivationAt: number | undefined): number => {
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
  activityAt: Map<ConnectionIdentifier, number>;
  pageSize: number;
};

type ParticipantsIndexingResult<T extends ParticipantForTiles> = {
  participantKeys: ConnectionIdentifier[];
  participantsByKey: Map<ConnectionIdentifier, T>;
};

const persistedOrderByHookInstance = new Map<string, PersistedOrderingState>();
let hookInstanceCounter = 0;

const readNow = (): number => Date.now();

const getParticipantKey = <T extends ParticipantForTiles>(participant: T): ConnectionIdentifier | null => {
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

const mapKeysToTiles = <T extends ParticipantForTiles>(
  orderedKeys: ConnectionIdentifier[],
  participantsByKey: Map<ConnectionIdentifier, T>,
  splitScreenShare: boolean
): CinemaViewTile<T>[] => {
  const tiles: CinemaViewTile<T>[] = [];

  for (const key of orderedKeys) {
    const participant = participantsByKey.get(key);
    if (!participant) {
      continue;
    }
    // V2-CLEANUP: In V1 there is only camera tile source. After transition to V2 this condition can be removed
    if (!splitScreenShare) {
      tiles.push({ participant, connectionIdentifier: key, source: Track.Source.Camera, tileKey: key });
    } else {
      // The Camera tile for participant exists always
      // Add additional ScreenShare tile before the camera tile, if participant shares screen
      if (participant.isScreenShareEnabled) {
        tiles.push({
          participant,
          connectionIdentifier: key,
          source: Track.Source.ScreenShare,
          tileKey: `${key}:screen`,
        });
      }
      tiles.push({ participant, connectionIdentifier: key, source: Track.Source.Camera, tileKey: key });
    }
  }

  return tiles;
};

const indexParticipantsForOrdering = <T extends ParticipantForTiles>(
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

const computeCameraActivationAt = <T extends ParticipantForTiles>(
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
const orderStripByActivity = <T extends ParticipantForTiles>(
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

const orderGridByPriority = <T extends ParticipantForTiles>(
  order: ConnectionIdentifier[],
  participantsByKey: Map<ConnectionIdentifier, T>,
  cameraActivationAt: Map<ConnectionIdentifier, number>,
  newlyActiveKeys: Set<ConnectionIdentifier>,
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

  // Pass 2: promote newly active participants from later pages
  for (let i = firstPageLimit; i < workingOrder.length; i++) {
    const candidateKey = workingOrder[i];
    if (candidateKey === currentSpeaker || !newlyActiveKeys.has(candidateKey)) {
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

export type ParticipantTilesOptions = {
  // When true, ordering is computed for a single, scrollable strip (the
  // SpeakerView `Filmstrip`) instead of the paginated cinema grid
  unbounded?: boolean;
  // Featured fallback alone does not grant grid priority; pins and qualified active speakers do.
  featuredConnectionIdentifier?: ConnectionIdentifier;
  suspendReordering?: boolean;
};

/**
 *
 * Maps participants to tiles
 *
 * A participant can have up to 2 tiles:
 *  - a camera tile, always
 *  - a screen share tile, while they share their screen (V2 only)
 *
 * @param participants - Sorted participants.
 * @param options - Optional behavior switches; see
 *   {@link ParticipantTilesOptions}.
 */
export function useOrderedTiles<T extends ParticipantForTiles>(participants: T[], options?: ParticipantTilesOptions) {
  const unbounded = options?.unbounded === true;
  const suspendReordering = options?.suspendReordering === true;
  // V2-CLEANUP: always split screen shares into their own tile after transition to V2
  const { isV2 } = useConferenceUiVersion();
  const [hookInstanceId] = useState(() => `useOrderedTiles-${hookInstanceCounter++}`);
  const { participantKeys, participantsByKey } = useMemo(
    () => indexParticipantsForOrdering(participants),
    [participants]
  );
  const featuredConnectionIdentifier = options?.featuredConnectionIdentifier;
  const pinnedConnectionIdentifier = useAppSelector(selectPinnedTile)?.connectionIdentifier;
  const featuredParticipant = featuredConnectionIdentifier
    ? participantsByKey.get(featuredConnectionIdentifier)
    : undefined;
  const priorityConnectionIdentifier =
    pinnedConnectionIdentifier ??
    (featuredParticipant?.isSpeaking && featuredParticipant.lastSpokeAt ? featuredConnectionIdentifier : undefined);

  const currentPage = useAppSelector(selectPaginationPageState);
  const maxGridTiles = useGridPageSize();

  const cinemaViewOrder = useAppSelector(selectCinemaViewOrder);
  const currentPageIndex = Math.max(currentPage - 1, 0);

  useEffect(() => {
    return () => {
      persistedOrderByHookInstance.delete(hookInstanceId);
    };
  }, [hookInstanceId]);

  const { orderedKeys, cameraActivationAt, activityAt } = useMemo(() => {
    const persistedState = persistedOrderByHookInstance.get(hookInstanceId);
    const isActivityFirst = cinemaViewOrder === CinemaViewSortOrder.ActivityFirst;
    const isSortOrderChanged = persistedState?.sortOrder !== cinemaViewOrder;

    const nextOrder =
      isActivityFirst && persistedState && !isSortOrderChanged
        ? reconcileOrder(persistedState.orderedKeys, participantKeys)
        : participantKeys;

    const computedCameraActivationAt = computeCameraActivationAt(
      participantKeys,
      participantsByKey,
      persistedState?.cameraActivationAt,
      readNow()
    );
    // A changed page size redefines which slots exist, so membership is re-evaluated.
    // A departure only closes the gap, which keeps the remaining tiles in place.
    const resetActivity = isSortOrderChanged || persistedState?.pageSize !== maxGridTiles;
    const previousActivityAt = resetActivity ? undefined : persistedState?.activityAt;

    if (!isActivityFirst || unbounded || currentPageIndex !== 0 || suspendReordering) {
      return {
        orderedKeys:
          isActivityFirst && unbounded
            ? orderStripByActivity(nextOrder, participantsByKey, computedCameraActivationAt)
            : nextOrder,
        cameraActivationAt: computedCameraActivationAt,
        activityAt: previousActivityAt ?? new Map(),
      };
    }

    const computedActivityAt = new Map(
      nextOrder.map((key) => [
        key,
        Math.max(
          participantsByKey.get(key)?.lastSpokeAt?.getTime() ?? Number.NEGATIVE_INFINITY,
          computedCameraActivationAt.get(key) ?? Number.NEGATIVE_INFINITY
        ),
      ])
    );
    const newlyActiveKeys = new Set(
      nextOrder.filter(
        (key) =>
          (computedActivityAt.get(key) ?? Number.NEGATIVE_INFINITY) >
          (previousActivityAt?.get(key) ?? Number.NEGATIVE_INFINITY)
      )
    );
    const reordered = orderGridByPriority(
      nextOrder,
      participantsByKey,
      computedCameraActivationAt,
      newlyActiveKeys,
      priorityConnectionIdentifier,
      maxGridTiles
    );

    return { orderedKeys: reordered, cameraActivationAt: computedCameraActivationAt, activityAt: computedActivityAt };
  }, [
    participantKeys,
    participantsByKey,
    hookInstanceId,
    cinemaViewOrder,
    priorityConnectionIdentifier,
    maxGridTiles,
    currentPageIndex,
    unbounded,
    suspendReordering,
  ]);

  useLayoutEffect(() => {
    persistedOrderByHookInstance.set(hookInstanceId, {
      orderedKeys,
      sortOrder: cinemaViewOrder,
      cameraActivationAt,
      activityAt,
      pageSize: maxGridTiles,
    });
  }, [hookInstanceId, orderedKeys, cinemaViewOrder, cameraActivationAt, activityAt, maxGridTiles]);

  const orderedTiles = mapKeysToTiles(orderedKeys, participantsByKey, isV2);
  const pageStartIndex = currentPageIndex * maxGridTiles;
  const pageEndIndex = (currentPageIndex + 1) * maxGridTiles;

  return {
    pageTiles: orderedTiles.slice(pageStartIndex, pageEndIndex),
    orderedTiles,
  };
}
