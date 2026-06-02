// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';

import type { ExcalidrawElements } from '../../api/types/incoming/whiteboard';
import type { ParticipantId } from '../../types';

export type ElementSnapshot = {
  version: number;
  versionNonce: number;
  isDeleted: boolean;
};

export type ElementSnapshotMap = Map<string, ElementSnapshot>;
export type SceneVersionRelation = 'equal' | 'incoming-newer' | 'local-newer' | 'conflict';
export type StoreSceneLeaderCandidate = {
  id: ParticipantId;
  joinedAt: string;
};

export const toSnapshot = (element: ExcalidrawElement): ElementSnapshot => ({
  version: element.version,
  versionNonce: element.versionNonce,
  isDeleted: Boolean(element.isDeleted),
});

export const buildSnapshotMap = (elements: readonly ExcalidrawElement[]): ElementSnapshotMap => {
  const map: ElementSnapshotMap = new Map();

  for (const element of elements) {
    map.set(element.id, toSnapshot(element));
  }

  return map;
};

export const getChangedElements = (
  currentElements: readonly ExcalidrawElement[],
  previousSnapshot: ElementSnapshotMap
): ExcalidrawElements => {
  const changed: ExcalidrawElement[] = [];

  for (const element of currentElements) {
    const prev = previousSnapshot.get(element.id);

    if (
      !prev ||
      prev.version !== element.version ||
      prev.versionNonce !== element.versionNonce ||
      prev.isDeleted !== Boolean(element.isDeleted)
    ) {
      changed.push(element);
    }
  }

  return changed as ExcalidrawElements;
};

// A dropped snapshot entry means we can no longer describe the delta safely and should escalate to a full sync.
export const hasMissingSnapshotElements = (
  currentElements: readonly ExcalidrawElement[],
  previousSnapshot: ElementSnapshotMap
): boolean => {
  const currentIds = new Set(currentElements.map((element) => element.id));

  for (const elementId of previousSnapshot.keys()) {
    if (!currentIds.has(elementId)) {
      return true;
    }
  }

  return false;
};

// Undo/redo can resurrect older element revisions, which is where patch-based sync is most fragile.
export const hasVersionRegression = (
  currentElements: readonly ExcalidrawElement[],
  previousSnapshot: ElementSnapshotMap
): boolean => {
  for (const element of currentElements) {
    const prev = previousSnapshot.get(element.id);

    if (prev && element.version < prev.version) {
      return true;
    }
  }

  return false;
};

export const countVisibleElements = (elements: readonly ExcalidrawElement[]): number =>
  elements.filter((element) => !element.isDeleted).length;

export const compareSceneVersions = (
  localElements: readonly ExcalidrawElement[],
  incomingElements: readonly ExcalidrawElement[]
): SceneVersionRelation => {
  const localSnapshot = buildSnapshotMap(localElements);
  const incomingSnapshot = buildSnapshotMap(incomingElements);

  let incomingHasNewerState = false;
  let localHasNewerState = false;

  for (const [elementId, incomingElement] of incomingSnapshot) {
    const localElement = localSnapshot.get(elementId);

    if (!localElement) {
      incomingHasNewerState = true;
      continue;
    }

    if (incomingElement.version > localElement.version) {
      incomingHasNewerState = true;
      continue;
    }

    if (incomingElement.version < localElement.version) {
      localHasNewerState = true;
      continue;
    }

    if (
      incomingElement.versionNonce !== localElement.versionNonce ||
      incomingElement.isDeleted !== localElement.isDeleted
    ) {
      return 'conflict';
    }
  }

  for (const elementId of localSnapshot.keys()) {
    if (!incomingSnapshot.has(elementId)) {
      localHasNewerState = true;
    }
  }

  if (incomingHasNewerState && localHasNewerState) {
    return 'conflict';
  }

  if (incomingHasNewerState) {
    return 'incoming-newer';
  }

  if (localHasNewerState) {
    return 'local-newer';
  }

  return 'equal';
};

export const selectStoreSceneLeaderId = (
  participants: readonly StoreSceneLeaderCandidate[]
): ParticipantId | undefined =>
  [...participants]
    .sort((first, second) => {
      const joinedAtOrder = first.joinedAt.localeCompare(second.joinedAt);

      if (joinedAtOrder !== 0) {
        return joinedAtOrder;
      }

      return first.id.localeCompare(second.id);
    })
    .at(0)?.id;
