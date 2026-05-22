// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';

import type { ParticipantId } from '../../types';
import {
  buildSnapshotMap,
  compareSceneVersions,
  countVisibleElements,
  getChangedElements,
  hasMissingSnapshotElements,
  hasVersionRegression,
  selectStoreSceneLeaderId,
} from './whiteboardHelper';

const createElement = (overrides: Partial<ExcalidrawElement> = {}): ExcalidrawElement =>
  ({
    id: overrides.id ?? 'element-1',
    type: overrides.type ?? 'rectangle',
    x: overrides.x ?? 0,
    y: overrides.y ?? 0,
    width: overrides.width ?? 100,
    height: overrides.height ?? 100,
    angle: overrides.angle ?? 0,
    strokeColor: overrides.strokeColor ?? '#000000',
    backgroundColor: overrides.backgroundColor ?? 'transparent',
    fillStyle: overrides.fillStyle ?? 'solid',
    strokeWidth: overrides.strokeWidth ?? 1,
    strokeStyle: overrides.strokeStyle ?? 'solid',
    roughness: overrides.roughness ?? 0,
    opacity: overrides.opacity ?? 100,
    groupIds: overrides.groupIds ?? [],
    frameId: overrides.frameId ?? null,
    roundness: overrides.roundness ?? null,
    seed: overrides.seed ?? 1,
    version: overrides.version ?? 1,
    versionNonce: overrides.versionNonce ?? 1,
    isDeleted: overrides.isDeleted ?? false,
    boundElements: overrides.boundElements ?? null,
    updated: overrides.updated ?? 1,
    link: overrides.link ?? null,
    locked: overrides.locked ?? false,
    index: overrides.index ?? 'a0',
  }) as ExcalidrawElement;

describe('whiteboardSync', () => {
  it('returns changed elements based on snapshot differences', () => {
    const previousElements = [createElement({ id: 'a', version: 1 }), createElement({ id: 'b', version: 2 })];
    const currentElements = [createElement({ id: 'a', version: 2 }), createElement({ id: 'b', version: 2 })];

    expect(getChangedElements(currentElements, buildSnapshotMap(previousElements))).toEqual([currentElements[0]]);
  });

  it('detects when snapshot elements disappear entirely', () => {
    const previousElements = [createElement({ id: 'a' }), createElement({ id: 'b' })];
    const currentElements = [createElement({ id: 'a' })];

    expect(hasMissingSnapshotElements(currentElements, buildSnapshotMap(previousElements))).toBe(true);
  });

  it('detects version regressions as undo redo conflicts', () => {
    const previousElements = [createElement({ id: 'a', version: 5 })];
    const currentElements = [createElement({ id: 'a', version: 3 })];

    expect(hasVersionRegression(currentElements, buildSnapshotMap(previousElements))).toBe(true);
  });

  it('counts only non deleted elements as visible', () => {
    const elements = [createElement({ id: 'a' }), createElement({ id: 'b', isDeleted: true })];

    expect(countVisibleElements(elements)).toBe(1);
  });

  it('treats missing newer local elements as stale incoming full sync', () => {
    const localElements = [createElement({ id: 'a' }), createElement({ id: 'b' })];
    const incomingElements = [createElement({ id: 'a' })];

    expect(compareSceneVersions(localElements, incomingElements)).toBe('local-newer');
  });

  it('detects incoming full syncs that advance the local scene', () => {
    const localElements = [createElement({ id: 'a', version: 1 })];
    const incomingElements = [createElement({ id: 'a', version: 2 }), createElement({ id: 'b', version: 1 })];

    expect(compareSceneVersions(localElements, incomingElements)).toBe('incoming-newer');
  });

  it('selects the earliest joined participant as store scene leader', () => {
    const leaderParticipantId = selectStoreSceneLeaderId([
      { id: 'participant-2' as ParticipantId, joinedAt: '2026-03-19T10:01:00.000Z' },
      { id: 'participant-1' as ParticipantId, joinedAt: '2026-03-19T10:00:00.000Z' },
    ]);

    expect(leaderParticipantId).toBe('participant-1');
  });

  it('breaks joined-at ties deterministically by participant id', () => {
    const leaderParticipantId = selectStoreSceneLeaderId([
      { id: 'participant-b' as ParticipantId, joinedAt: '2026-03-19T10:00:00.000Z' },
      { id: 'participant-a' as ParticipantId, joinedAt: '2026-03-19T10:00:00.000Z' },
    ]);

    expect(leaderParticipantId).toBe('participant-a');
  });
});
