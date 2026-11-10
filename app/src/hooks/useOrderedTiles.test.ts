// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Store } from '@reduxjs/toolkit';
import { act } from '@testing-library/react';
import { waitFor } from '@testing-library/react';
import { Track } from 'livekit-client';

import { GRID_SIZES, MAX_GRID_TILES_MOBILE } from '../constants';
import { CinemaViewSortOrder } from '../store/slices/common';
import { updatedCinemaGridSize, updatedCinemaViewSortOrder } from '../store/slices/uiSlice';
import { ConnectionId, ConnectionIdentifier, ParticipantId } from '../types';
import { configureStore, mockedParticipant, renderHookWithProviders } from '../utils/testUtils';
import { useOrderedTiles } from './useOrderedTiles';

type MockedParticipant = {
  id: ParticipantId;
  connections: ConnectionId[];
  identity: string;
  joinedAt: string;
  lastSpokeAt?: Date;
  isSpeaking?: boolean;
  isCameraEnabled?: boolean;
  isScreenShareEnabled?: boolean;
};

type HookProps = {
  participants: Array<MockedParticipant>;
  featuredConnectionIdentifier?: ConnectionIdentifier;
};

const getMockedParticipants = (count: number): Array<MockedParticipant> => {
  return Array.from({ length: count }, (_, index) => {
    const participant = mockedParticipant(index);

    // Monotonically increasing join time. Each participant joins one second after the
    // previous one. Used by the ordering hook to break ties between never-spoken
    // participants ("longest inactive" = smallest joinedAt).
    participant.joinedAt = new Date(Date.UTC(2024, 0, 1, 0, 0, index)).toISOString();
    return participant;
  });
};

// Hook props with the featured participant passed the way the GridView does
const hookProps = (participants: Array<MockedParticipant>, featured?: MockedParticipant): HookProps => ({
  participants,
  featuredConnectionIdentifier: featured?.identity as ConnectionIdentifier | undefined,
});

const renderOrderedTiles = (initialProps: HookProps, { store, unbounded }: { store: Store; unbounded?: boolean }) =>
  renderHookWithProviders(
    ({ participants, featuredConnectionIdentifier }: HookProps) =>
      useOrderedTiles(participants, { featuredConnectionIdentifier, unbounded }),
    { store, options: { initialProps } }
  );

const useIsMobileMock = vi.fn().mockReturnValue(false);
vi.mock('./useMediaQuery', () => ({
  useIsMobile: () => useIsMobileMock(),
}));

const selectPaginationPageStateMock = vi.fn().mockReturnValue(1);
vi.mock('../store/slices/uiSlice', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('../store/slices/uiSlice');
  return {
    ...actual,
    selectPaginationPageState: () => selectPaginationPageStateMock(),
  };
});

// V2-CLEANUP: Remove the mock after transition to V2
const isV2Mock = vi.fn().mockReturnValue(false);
vi.mock('./useConferenceUiVersion', () => ({
  default: () => ({ isV2: isV2Mock() }),
}));

const SHARED_INITIAL_STATE = {
  initialState: {
    ui: {
      cinemaGridSize: 9,
      cinemaViewOrder: CinemaViewSortOrder.ActivityFirst,
    },
  },
};

const participantsOf = <T>(tiles: Array<{ participant: T }>) => tiles.map((tile) => tile.participant);

const createLastSpokenAtTestDate = (hour: number) => new Date(`2024-06-01T${hour.toString().padStart(2, '0')}:00:00Z`);

describe('useOrderedTiles', () => {
  it.each([
    { name: 'silent fallback', speaking: false, qualified: false, pinned: false, protected: false },
    { name: 'stopped speaker', speaking: false, qualified: true, pinned: false, protected: false },
    { name: 'unqualified speaker', speaking: true, qualified: false, pinned: false, protected: false },
    { name: 'qualified active speaker', speaking: true, qualified: true, pinned: false, protected: true },
    { name: 'pinned participant', speaking: false, qualified: false, pinned: true, protected: true },
  ])(
    'only protects the featured participant when appropriate: $name',
    ({ speaking, qualified, pinned, protected: isProtected }) => {
      const participants = getMockedParticipants(3);
      participants[0].isSpeaking = speaking;
      if (qualified) {
        participants[0].lastSpokeAt = createLastSpokenAtTestDate(1);
        participants[1].lastSpokeAt = createLastSpokenAtTestDate(2);
      }
      const { store } = configureStore({
        initialState: {
          ui: {
            cinemaGridSize: 2,
            cinemaViewOrder: CinemaViewSortOrder.ActivityFirst,
            pinnedTile: pinned
              ? { connectionIdentifier: participants[0].identity as ConnectionIdentifier, source: Track.Source.Camera }
              : undefined,
          },
        },
      });
      const { result, rerender } = renderOrderedTiles(hookProps(participants, participants[0]), { store });
      expect(participantsOf(result.current.pageTiles)).toEqual(participants.slice(0, 2));

      const cameraOn = { ...participants[2], isCameraEnabled: true };
      rerender(hookProps([...participants.slice(0, 2), cameraOn], participants[0]));
      const expectedOrder = isProtected
        ? [participants[0], cameraOn, participants[1]]
        : [cameraOn, participants[1], participants[0]];
      expect(participantsOf(result.current.orderedTiles)).toEqual(expectedOrder);
      expect(participantsOf(result.current.pageTiles)).toEqual(expectedOrder.slice(0, 2));
    }
  );

  it('tracks camera activity while suspended and applies it once on resuming', () => {
    const participants = getMockedParticipants(10);
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result, rerender } = renderHookWithProviders(
      ({ participants, suspended }: HookProps & { suspended: boolean }) =>
        useOrderedTiles(participants, { suspendReordering: suspended }),
      { store, options: { initialProps: { participants, suspended: false } } }
    );
    const cameraOn = [...participants.slice(0, 9), { ...participants[9], isCameraEnabled: true }];
    rerender({ participants: cameraOn, suspended: true });
    expect(participantsOf(result.current.pageTiles)).toEqual(participants.slice(0, 9));

    rerender({ participants: cameraOn, suspended: false });
    expect(participantsOf(result.current.pageTiles)).toEqual([cameraOn[9], ...participants.slice(1, 9)]);

    rerender({ participants, suspended: false });
    expect(participantsOf(result.current.pageTiles)).toEqual([participants[9], ...participants.slice(1, 9)]);
  });

  it('returns paginated tiles', () => {
    const participants = getMockedParticipants(20);
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result } = renderOrderedTiles(hookProps(participants), { store });
    expect(result.current.pageTiles).toHaveProperty('length', 9);
  });

  it.each(GRID_SIZES)('caps selected size %i on mobile without losing remaining participants', (cinemaGridSize) => {
    useIsMobileMock.mockReturnValue(true);
    selectPaginationPageStateMock.mockReturnValue(1);
    const pageSize = Math.min(cinemaGridSize, MAX_GRID_TILES_MOBILE);
    const participants = getMockedParticipants(25);
    const { store } = configureStore({ initialState: { ui: { cinemaGridSize } } });
    const { result, unmount } = renderOrderedTiles(hookProps(participants), { store });
    expect(participantsOf(result.current.pageTiles)).toEqual(participants.slice(0, pageSize));
    unmount();
    selectPaginationPageStateMock.mockReturnValue(2);
    const { result: secondPage } = renderOrderedTiles(hookProps(participants), { store });
    selectPaginationPageStateMock.mockReturnValue(1);
    useIsMobileMock.mockReturnValue(false);
    expect(participantsOf(secondPage.current.pageTiles)).toEqual(participants.slice(pageSize, pageSize * 2));
  });

  it.each(GRID_SIZES)('keeps selected page size %i on desktop', (cinemaGridSize) => {
    useIsMobileMock.mockReturnValue(false);
    selectPaginationPageStateMock.mockReturnValue(1);
    const participants = getMockedParticipants(25);
    const { store } = configureStore({ initialState: { ui: { cinemaGridSize } } });
    const { result } = renderOrderedTiles(hookProps(participants), { store });
    expect(participantsOf(result.current.pageTiles)).toEqual(participants.slice(0, cinemaGridSize));
  });

  it('appends a new participant tile without camera or audio activity to page 2 (gridSize 6)', () => {
    const initialParticipants = getMockedParticipants(6);
    const updatedParticipants = getMockedParticipants(7);
    const { store } = configureStore({
      initialState: {
        ui: {
          cinemaGridSize: 6,
          cinemaViewOrder: CinemaViewSortOrder.ActivityFirst,
        },
      },
    });
    const { result, rerender } = renderOrderedTiles(hookProps(initialParticipants), { store });
    expect(result.current.pageTiles).toHaveLength(6);
    rerender(hookProps(updatedParticipants));
    expect(result.current.pageTiles).toHaveLength(6);
    expect(participantsOf(result.current.pageTiles)).not.toContainEqual(updatedParticipants[6]);
    expect(result.current.orderedTiles).toHaveLength(7);
  });

  it('returns participants as is when no one is currently speaking', () => {
    const participants = getMockedParticipants(20);
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result } = renderOrderedTiles(hookProps(participants), { store });
    expect(participantsOf(result.current.pageTiles)).toEqual(participants.slice(0, 9));
  });

  it('returns participants as is when the current speaker is on the first page already', () => {
    const participants = getMockedParticipants(20);
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result } = renderOrderedTiles(hookProps(participants, participants[5]), { store });
    expect(participantsOf(result.current.pageTiles)).toEqual(participants.slice(0, 9));
  });

  it('places the current speaker on the first page in place of the earliest never-spoken participant', () => {
    const participants = getMockedParticipants(20);
    participants[0].lastSpokeAt = createLastSpokenAtTestDate(1);
    participants[1].lastSpokeAt = createLastSpokenAtTestDate(2);
    participants[2].lastSpokeAt = createLastSpokenAtTestDate(3);
    participants[12].lastSpokeAt = createLastSpokenAtTestDate(4);
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result } = renderOrderedTiles(hookProps(participants, participants[12]), { store });
    const expectedOrder = [...participants];
    [expectedOrder[3], expectedOrder[12]] = [expectedOrder[12], expectedOrder[3]];
    expect(participantsOf(result.current.orderedTiles)).toEqual(expectedOrder);
    expect(participantsOf(result.current.pageTiles)).toEqual(expectedOrder.slice(0, 9));
  });

  it('replaces the participant with the smallest last-activity timestamp when no fully-inactive slot is available', () => {
    const participants = getMockedParticipants(10);
    // Page 1 is fully "active at some point": p0..p8 all spoke at increasing times.
    // The current speaker (p9) must displace the participant whose last activity is
    // oldest, i.e. p0 (smallest lastSpokeAt = longest inactive).
    for (let i = 0; i < 9; i++) {
      participants[i].lastSpokeAt = new Date(`2024-01-01T0${i + 1}:00:00Z`);
    }
    participants[9].lastSpokeAt = new Date(`2024-01-01T10:00:00Z`);
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result } = renderOrderedTiles(hookProps(participants, participants[9]), { store });
    expect(result.current.pageTiles[0].participant).toEqual(participants[9]);
    expect(participantsOf(result.current.pageTiles)).not.toContainEqual(participants[0]);
  });

  it('displaces the spoken page-1 participant with the oldest lastSpokeAt before any camera-on participant whose activation is more recent', () => {
    const participants = getMockedParticipants(10);
    // Page 1 mixes spoken-camera-off and camera-on (never-spoken) participants. The
    // camera-on slots had their cameras activated at hook-mount time, which is more
    // recent than every spoken participant's `lastSpokeAt` (June 2024). The longest
    // inactive slot is therefore the spoken participant with the oldest
    // `lastSpokeAt` (p0), not the camera-on slot with the smallest `joinedAt`.
    participants[0].lastSpokeAt = createLastSpokenAtTestDate(1);
    participants[1].lastSpokeAt = createLastSpokenAtTestDate(2);
    participants[2].lastSpokeAt = createLastSpokenAtTestDate(3);
    participants[3].isCameraEnabled = true;
    participants[4].isCameraEnabled = true;
    participants[5].lastSpokeAt = createLastSpokenAtTestDate(4);
    participants[6].lastSpokeAt = createLastSpokenAtTestDate(5);
    participants[7].lastSpokeAt = createLastSpokenAtTestDate(6);
    participants[8].lastSpokeAt = createLastSpokenAtTestDate(7);
    participants[9].lastSpokeAt = createLastSpokenAtTestDate(8);
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result } = renderOrderedTiles(hookProps(participants, participants[9]), { store });
    expect(participantsOf(result.current.pageTiles)).toEqual([participants[9], ...participants.slice(1, 9)]);
  });

  it('promotes a speaker without displacing a more recently activated camera', () => {
    const participants = getMockedParticipants(10);
    participants[0].lastSpokeAt = createLastSpokenAtTestDate(1);
    participants[1].isCameraEnabled = true;
    participants[1].joinedAt = '2024-02-01T00:00:00Z';
    participants[9].lastSpokeAt = createLastSpokenAtTestDate(2);
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result } = renderOrderedTiles(hookProps(participants, participants[9]), { store });
    expect(participantsOf(result.current.pageTiles).slice(0, 3)).toEqual([
      participants[0],
      participants[1],
      participants[9],
    ]);
    expect(participantsOf(result.current.pageTiles)).not.toContainEqual(participants[2]);
  });

  it('promotes a participant from page 2 to page 1 when they turn their camera on', () => {
    const participants = getMockedParticipants(10);
    // p9 joined before everyone else, so `joinedAt` alone would keep them on page 2.
    // Only the camera activation timestamp can lift them onto page 1.
    participants[9].joinedAt = new Date(Date.UTC(2023, 0, 1)).toISOString();
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result, rerender } = renderOrderedTiles(hookProps(participants), { store });
    expect(participantsOf(result.current.pageTiles)).not.toContainEqual(participants[9]);

    const cameraOn = { ...participants[9], isCameraEnabled: true };
    rerender(hookProps([...participants.slice(0, 9), cameraOn]));

    // Nobody spoke, so every page-1 score falls back to `joinedAt`. p0 joined first
    // among them and is therefore the longest inactive slot.
    expect(result.current.pageTiles[0].participant).toEqual(cameraOn);
    expect(participantsOf(result.current.pageTiles)).not.toContainEqual(participants[0]);

    // The activation timestamp is remembered, so the tile does not keep displacing a
    // new page-1 slot on every following render.
    rerender(hookProps([...participants.slice(0, 9), cameraOn]));
    expect(result.current.pageTiles[0].participant).toEqual(cameraOn);
    expect(participantsOf(result.current.pageTiles)).toContainEqual(participants[1]);
  });

  it('promotes several camera-on participants onto the longest inactive page-1 slots', () => {
    const participants = getMockedParticipants(11);
    participants[9].joinedAt = new Date(Date.UTC(2023, 0, 1, 0, 0, 0)).toISOString();
    participants[10].joinedAt = new Date(Date.UTC(2023, 0, 1, 0, 0, 1)).toISOString();
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result, rerender } = renderOrderedTiles(hookProps(participants), { store });

    const camerasOn = [
      { ...participants[9], isCameraEnabled: true },
      { ...participants[10], isCameraEnabled: true },
    ];
    rerender(hookProps([...participants.slice(0, 9), ...camerasOn]));

    const page = participantsOf(result.current.pageTiles);
    expect(page).toContainEqual(camerasOn[0]);
    expect(page).toContainEqual(camerasOn[1]);
    expect(page).not.toContainEqual(participants[0]);
    expect(page).not.toContainEqual(participants[1]);
  });

  it.each([false, true])(
    'keeps a newly activated camera in its visible slot (previous speech: %s)',
    (hasPreviousSpeech) => {
      const participants = getMockedParticipants(5);
      if (hasPreviousSpeech) {
        participants.forEach((participant, index) => {
          participant.lastSpokeAt = createLastSpokenAtTestDate(5 - index);
        });
      }
      const { store } = configureStore(SHARED_INITIAL_STATE);
      const { result, rerender } = renderOrderedTiles(hookProps(participants), { store });
      expect(participantsOf(result.current.pageTiles)).toEqual(participants);

      const cameraOn = { ...participants[4], isCameraEnabled: true };
      rerender(hookProps([...participants.slice(0, 4), cameraOn]));

      expect(participantsOf(result.current.pageTiles)).toEqual([...participants.slice(0, 4), cameraOn]);
    }
  );

  it('keeps visible participants in their slots when newer speech arrives', () => {
    const participants = getMockedParticipants(5);
    participants.forEach((participant, index) => {
      participant.lastSpokeAt = createLastSpokenAtTestDate(index + 1);
    });
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result, rerender } = renderOrderedTiles(hookProps(participants), { store });
    expect(participantsOf(result.current.pageTiles)).toEqual(participants);

    const speakingAgain = { ...participants[4], lastSpokeAt: createLastSpokenAtTestDate(6) };
    const updatedParticipants = [...participants.slice(0, 4), speakingAgain];
    rerender(hookProps(updatedParticipants, speakingAgain));
    expect(participantsOf(result.current.pageTiles)).toEqual(updatedParticipants);
  });

  it('preserves the previous order when activity timestamps are equal', () => {
    const participants = getMockedParticipants(5);
    participants.forEach((participant) => {
      participant.lastSpokeAt = createLastSpokenAtTestDate(1);
    });
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result, rerender } = renderOrderedTiles(hookProps(participants), { store });
    rerender(hookProps([...participants].reverse()));
    expect(participantsOf(result.current.pageTiles)).toEqual(participants);
  });

  it('keeps a tile in place when it loses activity instead of sinking it', () => {
    const participants = getMockedParticipants(5);
    participants.forEach((participant, index) => {
      participant.lastSpokeAt = createLastSpokenAtTestDate(index + 1);
    });
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result, rerender } = renderOrderedTiles(hookProps(participants), { store });

    rerender(hookProps([{ ...participants[0], isCameraEnabled: true }, ...participants.slice(1)]));
    expect(result.current.pageTiles[0].participant.id).toBe(participants[0].id);

    rerender(hookProps([{ ...participants[0], isCameraEnabled: false }, ...participants.slice(1)]));
    expect(result.current.pageTiles[0].participant.id).toBe(participants[0].id);
  });

  it('does not promote old page-2 activity when a page-1 camera turns off', () => {
    const participants = getMockedParticipants(10);
    participants.forEach((participant) => {
      participant.lastSpokeAt = createLastSpokenAtTestDate(6);
    });
    participants[0].lastSpokeAt = createLastSpokenAtTestDate(1);
    participants[0].isCameraEnabled = true;
    participants[9].lastSpokeAt = createLastSpokenAtTestDate(5);
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result, rerender } = renderOrderedTiles(hookProps(participants, participants[1]), { store });
    const idsOf = (tiles: typeof result.current.pageTiles) => tiles.map((tile) => tile.participant.id);
    const originalOrder = idsOf(result.current.orderedTiles);
    expect(result.current.pageTiles[0].participant.id).toBe(participants[0].id);
    expect(idsOf(result.current.pageTiles)).not.toContain(participants[9].id);

    const cameraOff = participants.map((participant) => ({ ...participant, isCameraEnabled: false }));
    rerender(hookProps(cameraOff, participants[1]));
    expect(idsOf(result.current.orderedTiles)).toEqual(originalOrder);

    const pageOneSpeech = [...cameraOff];
    pageOneSpeech[1] = { ...pageOneSpeech[1], lastSpokeAt: createLastSpokenAtTestDate(7) };
    rerender(hookProps(pageOneSpeech, participants[1]));
    expect(idsOf(result.current.orderedTiles)).toEqual(originalOrder);
    expect(idsOf(result.current.pageTiles)).not.toContain(participants[9].id);

    const pageTwoSpeech = [...pageOneSpeech];
    pageTwoSpeech[9] = { ...pageTwoSpeech[9], lastSpokeAt: createLastSpokenAtTestDate(8) };
    rerender(hookProps(pageTwoSpeech, participants[1]));
    expect(result.current.pageTiles[0].participant.id).toBe(participants[9].id);
    expect(idsOf(result.current.pageTiles)).not.toContain(participants[0].id);
  });

  it('re-evaluates page membership after a grid resize', () => {
    const participants = getMockedParticipants(11);
    participants.forEach((participant) => {
      participant.lastSpokeAt = createLastSpokenAtTestDate(6);
    });
    participants[0].lastSpokeAt = createLastSpokenAtTestDate(1);
    participants[0].isCameraEnabled = true;
    participants[9].lastSpokeAt = createLastSpokenAtTestDate(5);
    participants[10].lastSpokeAt = createLastSpokenAtTestDate(4);
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result, rerender } = renderOrderedTiles(hookProps(participants), { store });

    const cameraOff = participants.map((participant) => ({ ...participant, isCameraEnabled: false }));
    rerender(hookProps(cameraOff));
    expect(result.current.pageTiles[0].participant.id).toBe(participants[0].id);

    act(() => {
      store.dispatch(updatedCinemaGridSize(6));
    });

    expect(participantsOf(result.current.pageTiles)).toEqual([cameraOff[6], ...cameraOff.slice(1, 6)]);
    expect(result.current.orderedTiles).toHaveLength(11);
  });

  it('only closes the gap when a participant leaves, without reshuffling the page', () => {
    const participants = getMockedParticipants(11);
    participants.forEach((participant, index) => {
      participant.lastSpokeAt = createLastSpokenAtTestDate(index + 1);
    });
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result, rerender } = renderOrderedTiles(hookProps(participants), { store });
    const settledOrder = result.current.orderedTiles.map((tile) => tile.participant.id);

    const remaining = participants.filter((participant) => participant.id !== settledOrder[3]);
    rerender(hookProps(remaining));

    expect(result.current.orderedTiles.map((tile) => tile.participant.id)).toEqual(
      settledOrder.filter((id) => id !== settledOrder[3])
    );
  });

  it('swaps consecutive speakers into inactive slots and keeps them there when speech stops', () => {
    const participants = getMockedParticipants(11);
    // p0..p8 are inactive on page 1; p9 (page 2) starts speaking.
    participants[9].lastSpokeAt = createLastSpokenAtTestDate(9);
    participants[9].isSpeaking = true;
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result, rerender } = renderOrderedTiles(hookProps(participants, participants[9]), { store });
    // p9 displaces p0 (first inactive).
    expect(result.current.pageTiles[0].participant).toEqual(participants[9]);
    participants[9].isSpeaking = false;
    participants[10].lastSpokeAt = createLastSpokenAtTestDate(10);
    participants[10].isSpeaking = true;
    rerender(hookProps(participants, participants[10]));
    const expectedPage = [participants[9], participants[10], ...participants.slice(2, 9)];
    expect(participantsOf(result.current.pageTiles)).toEqual(expectedPage);

    participants[10].isSpeaking = false;
    rerender(hookProps(participants));
    expect(participantsOf(result.current.pageTiles)).toEqual(expectedPage);
  });

  it('removes participants who left the call from the order', () => {
    const participants = getMockedParticipants(10);
    participants[9].lastSpokeAt = new Date();
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result, rerender } = renderOrderedTiles(hookProps(participants, participants[9]), { store });
    expect(participantsOf(result.current.pageTiles)).toContainEqual(participants[9]);
    const updatedParticipants = participants.slice(1);
    rerender(hookProps(updatedParticipants, participants[9]));
    expect(participantsOf(result.current.pageTiles)).toContainEqual(participants[9]);
    expect(participantsOf(result.current.pageTiles)).not.toContainEqual(participants[0]);
  });

  it('adds new participants to the end of the order', () => {
    const participants = getMockedParticipants(10);
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result, rerender } = renderOrderedTiles(hookProps(participants.slice(0, 8), participants[0]), { store });
    expect(result.current.pageTiles[0].participant).toEqual(participants[0]);
    rerender(hookProps(participants.slice(0, 9), participants[0]));
    expect(result.current.pageTiles).toHaveLength(9);
    expect(result.current.pageTiles[8].participant).toEqual(participants[8]);
  });

  it('treats same id with a new connection as a new entity and appends it', () => {
    const participants = getMockedParticipants(8);
    const participantWithNewConnection = {
      ...participants[0],
      connections: ['10000000-e6b4-4759-0099' as ConnectionId],
      identity: `${participants[0].id}:10000000-e6b4-4759-0099`,
    };
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result, rerender } = renderOrderedTiles(hookProps(participants), { store });

    expect(result.current.pageTiles).toHaveLength(8);
    rerender(hookProps([...participants, participantWithNewConnection]));
    expect(result.current.pageTiles).toHaveLength(9);
    expect(result.current.pageTiles[8].participant).toEqual(participantWithNewConnection);
  });

  it('resets the order when the sort criterion changes', async () => {
    const participants = getMockedParticipants(10);
    participants[9].lastSpokeAt = new Date();
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result, rerender } = renderOrderedTiles(hookProps(participants, participants[9]), { store });
    expect(participantsOf(result.current.pageTiles)).not.toEqual(participants.slice(0, 9));
    const currentSortOrder = store.getState().ui.cinemaViewOrder;
    const nextSortOrder =
      currentSortOrder === CinemaViewSortOrder.ActivityFirst
        ? CinemaViewSortOrder.FirstJoined
        : CinemaViewSortOrder.ActivityFirst;
    act(() => {
      store.dispatch(updatedCinemaViewSortOrder(nextSortOrder));
    });
    rerender(hookProps(participants));
    await waitFor(() => {
      expect(participantsOf(result.current.pageTiles)).toEqual(participants.slice(0, 9));
    });
  });

  it('does not swap when the current speaker is already on the first page after reconciliation', () => {
    const participants = getMockedParticipants(10);
    // p0..p8 are inactive on page 1; p9 is the current speaker (page 2).
    participants[9].lastSpokeAt = new Date();
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result, rerender } = renderOrderedTiles(hookProps(participants, participants[9]), { store });
    // p9 displaces p0 (first inactive).
    expect(result.current.pageTiles[0].participant).toEqual(participants[9]);

    // Speaker changes to p1, who is already on page 1 -> no further swap should occur.
    rerender(hookProps(participants, participants[1]));

    expect(result.current.pageTiles[0].participant).toEqual(participants[9]);
    expect(participantsOf(result.current.pageTiles)).toContainEqual(participants[1]);
  });

  it('preserves order when the current speaker becomes undefined after a prior swap', () => {
    const participants = getMockedParticipants(10);
    participants[9].lastSpokeAt = new Date();
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result, rerender } = renderOrderedTiles(hookProps(participants, participants[9]), { store });
    expect(result.current.pageTiles[0].participant).toEqual(participants[9]);
    rerender(hookProps(participants));
    expect(result.current.pageTiles[0].participant).toEqual(participants[9]);
  });

  it('reapplies current speaker promotion after the sort criterion changes', () => {
    const participants = getMockedParticipants(10);
    participants[9].lastSpokeAt = new Date();
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result } = renderOrderedTiles(hookProps(participants, participants[9]), { store });
    expect(result.current.pageTiles[0].participant).toEqual(participants[9]);
    store.dispatch(updatedCinemaViewSortOrder(CinemaViewSortOrder.FirstJoined));
    store.dispatch(updatedCinemaViewSortOrder(CinemaViewSortOrder.ActivityFirst));
    expect(result.current.pageTiles[0].participant).toEqual(participants[9]);
  });

  it('does not perform any swap when sort order is not ActivityFirst', () => {
    const participants = getMockedParticipants(10);
    for (let i = 0; i < 9; i++) {
      participants[i].lastSpokeAt = new Date(`2024-01-01T0${i + 1}:00:00Z`);
    }
    const { store } = configureStore({
      initialState: {
        ui: {
          cinemaGridSize: 9,
          cinemaViewOrder: CinemaViewSortOrder.VideoFirst,
        },
      },
    });
    const { result } = renderOrderedTiles(hookProps(participants, participants[9]), { store });
    expect(result.current.pageTiles[0]).not.toEqual(participants[9]);
  });

  it.each([CinemaViewSortOrder.VideoFirst, CinemaViewSortOrder.ModeratorsFirst, CinemaViewSortOrder.FirstJoined])(
    'follows the upstream order on every render when sorting by %s',
    (cinemaViewOrder) => {
      const participants = getMockedParticipants(5);
      const { store } = configureStore({ initialState: { ui: { cinemaGridSize: 9, cinemaViewOrder } } });
      const { result, rerender } = renderOrderedTiles(hookProps(participants), { store });
      expect(participantsOf(result.current.pageTiles)).toEqual(participants);

      // `sortCinemaViewParticipants` re-sorts upstream, here moving the last joiner to
      // the front after they turned their camera on.
      const cameraOn = { ...participants[4], isCameraEnabled: true };
      const resorted = [cameraOn, ...participants.slice(0, 4)];
      rerender(hookProps(resorted));

      expect(participantsOf(result.current.pageTiles)).toEqual(resorted);
    }
  );

  it('promotes a page-2 participant who starts speaking onto page 1 (gridSize 6 + extra users)', () => {
    const initialParticipants = getMockedParticipants(8);
    const { store } = configureStore({
      initialState: {
        ui: {
          cinemaGridSize: 6,
          cinemaViewOrder: CinemaViewSortOrder.ActivityFirst,
        },
      },
    });
    const { result, rerender } = renderOrderedTiles(hookProps(initialParticipants), { store });
    // Page 1 initially holds the first 6 participants; p6 and p7 are on page 2.
    expect(result.current.pageTiles).toHaveLength(6);
    expect(participantsOf(result.current.pageTiles)).not.toContainEqual(initialParticipants[7]);

    // p7 (page 2) starts speaking, but is not the current/pinned speaker.
    const updatedParticipants = initialParticipants.map((participant) => ({ ...participant }));
    updatedParticipants[7].lastSpokeAt = createLastSpokenAtTestDate(5);
    rerender(hookProps(updatedParticipants));

    // p7 is promoted onto page 1, displacing the longest-inactive page-1 slot (p0,
    // the earliest joiner with no activity).
    expect(participantsOf(result.current.pageTiles)).toContainEqual(updatedParticipants[7]);
    expect(participantsOf(result.current.pageTiles)).not.toContainEqual(updatedParticipants[0]);
  });

  it('promotes a camera-on participant from page > 1 onto the first spot on page 1', () => {
    const participants = getMockedParticipants(20);
    // page 1 (indices 0..8): nobody spoke, nobody has a camera on -> all valid swap targets.
    // outside page 1 (indices 9..19): index 12 is camera-on, the rest are camera-off.
    participants[12].isCameraEnabled = true;
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result } = renderOrderedTiles(hookProps(participants), { store });
    // The camera-on candidate replaces the earliest joiner without activity (p0) and
    // therefore lands on the first spot of page 1.
    expect(result.current.pageTiles[0].participant).toEqual(participants[12]);
    expect(participantsOf(result.current.pageTiles)).not.toContainEqual(participants[0]);
    // `orderedTiles` still exposes every participant, with the camera-on
    // candidate moved to the front.
    expect(result.current.orderedTiles).toHaveLength(20);
    expect(result.current.orderedTiles[0].participant).toEqual(participants[12]);
  });

  it('does not promote a camera-on candidate when every page-1 participant is more recently active than the candidate', () => {
    const participants = getMockedParticipants(20);
    // All page-1 participants have a camera on and joined later than the candidate.
    // Their inactivity scores (= joinedAt, since none of them spoke) are therefore all
    // larger than p12's score. The score check refuses the swap, so nothing changes.
    for (let i = 0; i < 9; i++) {
      participants[i].isCameraEnabled = true;
    }
    participants[12].isCameraEnabled = true;
    // Force p12 to be the earliest joiner so they are *more inactive* than every
    // page-1 participant -> swap would demote a more recently active slot.
    participants[12].joinedAt = '2023-01-01T00:00:00Z';
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result } = renderOrderedTiles(hookProps(participants), { store });
    expect(participantsOf(result.current.pageTiles)).not.toContainEqual(participants[12]);
    expect(participantsOf(result.current.pageTiles)).toEqual(participants.slice(0, 9));
  });

  it('promotes a camera-on candidate by displacing the longest-inactive page-1 participant even if they spoke before', () => {
    const participants = getMockedParticipants(20);
    // All page-1 participants spoke at increasing times. p12 turns the camera on
    // *after* the latest of these speak events, so its inactivity score (joinedAt)
    // is larger than every page-1 lastSpokeAt -> the longest-inactive slot (p0) is
    // replaced by the camera-on candidate.
    for (let i = 0; i < 9; i++) {
      participants[i].lastSpokeAt = new Date(`2024-01-01T0${i + 1}:00:00Z`);
    }
    participants[12].isCameraEnabled = true;
    participants[12].joinedAt = '2024-01-01T10:00:00Z';
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result } = renderOrderedTiles(hookProps(participants), { store });
    expect(result.current.pageTiles[0].participant).toEqual(participants[12]);
    expect(participantsOf(result.current.pageTiles)).not.toContainEqual(participants[0]);
  });

  it('promotes both the current speaker and a camera-on candidate', () => {
    const participants = getMockedParticipants(20);
    participants[12].lastSpokeAt = new Date();
    participants[15].isCameraEnabled = true; // camera-on candidate outside page 1
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result } = renderOrderedTiles(hookProps(participants, participants[12]), { store });
    expect(participantsOf(result.current.pageTiles)).toContainEqual(participants[12]);
    expect(participantsOf(result.current.pageTiles)).toContainEqual(participants[15]);
  });

  it('does not resort the page when a previously promoted camera-on participant turns their camera off', () => {
    const initialParticipants = getMockedParticipants(11);
    // p10 starts with camera on -> promoted to position 0 on first render.
    initialParticipants[10].isCameraEnabled = true;
    const { store } = configureStore(SHARED_INITIAL_STATE);
    const { result, rerender } = renderOrderedTiles(hookProps(initialParticipants), { store });
    expect(result.current.pageTiles[0].participant).toEqual(initialParticipants[10]);

    // p10 turns the camera off. The score (`lastSpokeAt ?? joinedAt`) is unchanged, so
    // no immediate resort happens: p10 keeps their slot, "in line" with the other
    // participants on page 1.
    const updatedParticipants = initialParticipants.map((participant) => ({ ...participant }));
    updatedParticipants[10].isCameraEnabled = false;
    rerender(hookProps(updatedParticipants));
    expect(result.current.pageTiles[0].participant).toEqual(updatedParticipants[10]);
    expect(result.current.pageTiles).toHaveLength(9);
  });

  it('does not bring the displaced camera-on participant back to page 1 on the next render (no oscillation)', () => {
    // User scenario: 6 page-1 participants (3 spoke, 3 camera-on, never-spoke). The 7th
    // turns their camera on and replaces the longest-inactive page-1 slot (a camera-on
    // never-spoken participant, by score). The displaced participant must STAY on page
    // 2 across subsequent renders -- they must not "drop in again" and replace a
    // spoken-but-camera-off participant.
    const initialParticipants = getMockedParticipants(6);
    initialParticipants[0].lastSpokeAt = createLastSpokenAtTestDate(1);
    initialParticipants[1].lastSpokeAt = createLastSpokenAtTestDate(2);
    initialParticipants[2].lastSpokeAt = createLastSpokenAtTestDate(3);
    initialParticipants[3].isCameraEnabled = true;
    initialParticipants[4].isCameraEnabled = true;
    initialParticipants[5].isCameraEnabled = true;

    const { store } = configureStore({
      initialState: {
        ui: {
          cinemaGridSize: 6,
          cinemaViewOrder: CinemaViewSortOrder.ActivityFirst,
        },
      },
    });
    const { result, rerender } = renderOrderedTiles(hookProps(initialParticipants), { store });
    expect(result.current.pageTiles).toHaveLength(6);

    // 7th participant turns the camera on.
    const updatedParticipants = getMockedParticipants(7);
    updatedParticipants[0].lastSpokeAt = initialParticipants[0].lastSpokeAt;
    updatedParticipants[1].lastSpokeAt = initialParticipants[1].lastSpokeAt;
    updatedParticipants[2].lastSpokeAt = initialParticipants[2].lastSpokeAt;
    updatedParticipants[3].isCameraEnabled = true;
    updatedParticipants[4].isCameraEnabled = true;
    updatedParticipants[5].isCameraEnabled = true;
    updatedParticipants[6].isCameraEnabled = true;

    rerender(hookProps(updatedParticipants));
    // Page-1 inactivity scores:
    //   p0..p2 = spoken June 01:00..03:00.
    //   p3..p5 = camera-on, score = activation timestamp at hook mount (much more
    //     recent than June 2024).
    // p6 turns the camera on slightly later, so its score is also a recent
    // activation timestamp. The longest-inactive slot is therefore the spoken slot
    // with the oldest `lastSpokeAt` (p0); the three camera-on slots are protected
    // because their activation is much more recent.
    expect(participantsOf(result.current.pageTiles)).toContainEqual(updatedParticipants[6]);
    expect(participantsOf(result.current.pageTiles)).not.toContainEqual(updatedParticipants[0]);
    expect(participantsOf(result.current.pageTiles)).toContainEqual(updatedParticipants[3]);
    expect(participantsOf(result.current.pageTiles)).toContainEqual(updatedParticipants[4]);
    expect(participantsOf(result.current.pageTiles)).toContainEqual(updatedParticipants[5]);
    const pageAfterFirstSwap = result.current.pageTiles;

    // Trigger an unrelated re-render (no state change). The displaced p0 must NOT
    // come back: its `lastSpokeAt` is the oldest in the room, so the score check in
    // Step 2 prevents any swap target from being more inactive than them.
    rerender(hookProps(updatedParticipants.map((p) => ({ ...p }))));
    expect(participantsOf(result.current.pageTiles)).not.toContainEqual(updatedParticipants[0]);
    expect(result.current.pageTiles.map((p) => p.participant.identity)).toEqual(
      pageAfterFirstSwap.map((p) => p.participant.identity)
    );
  });

  describe('unbounded mode (used by SpeakerView Filmstrip)', () => {
    it('floats a camera-on participant that sits beyond the visible window to the front of the strip', () => {
      // The key bug this guards against: in a scrollable strip with only a few
      // visible thumbs, a participant who becomes active while sitting beyond the
      // visible window must move to the FRONT (into view), not merely swap one
      // position with an adjacent idle participant.
      const participants = getMockedParticipants(20);
      participants[15].isCameraEnabled = true;
      const { store } = configureStore(SHARED_INITIAL_STATE);
      const { result } = renderOrderedTiles(hookProps(participants), { store, unbounded: true });
      // p15 (the only active participant) floats to the very front of the strip.
      expect(result.current.orderedTiles[0].participant).toEqual(participants[15]);
      // Every idle participant keeps their reconciled relative order behind p15.
      const idleOrder = result.current.orderedTiles.slice(1).map((p) => p.participant.id);
      const expectedIdleOrder = participants.filter((_, i) => i !== 15).map((p) => p.id);
      expect(idleOrder).toEqual(expectedIdleOrder);
    });

    it('orders multiple active participants by most-recent activity first', () => {
      const participants = getMockedParticipants(20);
      // Three participants spoke at different times; the most recent should be
      // first in the strip, the oldest last among the active group.
      participants[10].lastSpokeAt = createLastSpokenAtTestDate(1);
      participants[5].lastSpokeAt = createLastSpokenAtTestDate(3);
      participants[18].lastSpokeAt = createLastSpokenAtTestDate(2);
      const { store } = configureStore(SHARED_INITIAL_STATE);
      const { result } = renderOrderedTiles(hookProps(participants), { store, unbounded: true });
      expect(result.current.orderedTiles[0].participant).toEqual(participants[5]); // 03:00 (newest)
      expect(result.current.orderedTiles[1].participant).toEqual(participants[18]); // 02:00
      expect(result.current.orderedTiles[2].participant).toEqual(participants[10]); // 01:00 (oldest active)
      // The rest (idle) follow in their reconciled order.
      const idleOrder = result.current.orderedTiles.slice(3).map((p) => p.participant.id);
      const expectedIdleOrder = participants.filter((_, i) => ![5, 18, 10].includes(i)).map((p) => p.id);
      expect(idleOrder).toEqual(expectedIdleOrder);
    });

    it('floats the current speaker to the front over the entire list', () => {
      const participants = getMockedParticipants(20);
      // Speaker sits at index 17, well past `cinemaGridSize` (= 9). In unbounded
      // mode the speaker, being active, floats to the very front of the strip.
      participants[17].lastSpokeAt = createLastSpokenAtTestDate(5);
      const { store } = configureStore(SHARED_INITIAL_STATE);
      const { result } = renderOrderedTiles(hookProps(participants, participants[17]), { store, unbounded: true });
      expect(result.current.orderedTiles[0].participant).toEqual(participants[17]);
    });

    it('keeps reordering even when the cinema-grid pagination is on a non-first page', () => {
      // Filmstrip renders independently of the cinema-grid pagination. Make the
      // shared `selectPaginationPageState` return a non-first page (which would
      // suppress all reordering in paginated mode) and verify that unbounded mode
      // still floats the camera-on participant to the front.
      selectPaginationPageStateMock.mockReturnValue(2);
      try {
        const participants = getMockedParticipants(20);
        participants[12].isCameraEnabled = true;
        const { store } = configureStore(SHARED_INITIAL_STATE);
        const { result } = renderOrderedTiles(hookProps(participants), { store, unbounded: true });
        expect(result.current.orderedTiles[0].participant).toEqual(participants[12]);
      } finally {
        selectPaginationPageStateMock.mockReturnValue(1);
      }
    });
  });

  describe('additional screen share tiles', () => {
    beforeEach(() => {
      isV2Mock.mockReturnValue(true);
    });

    // V2-CLEANUP: Remove after transition to V2
    it('does not add a separate screen share tile in ui V1', () => {
      isV2Mock.mockReturnValue(false);
      const participants = getMockedParticipants(3);
      participants[1].isScreenShareEnabled = true;
      const { store } = configureStore(SHARED_INITIAL_STATE);
      const { result } = renderOrderedTiles(hookProps(participants), { store });
      expect(result.current.orderedTiles).toHaveLength(3);
    });

    it('creates a camera tile for every participant', () => {
      const participants = getMockedParticipants(3);
      const { store } = configureStore(SHARED_INITIAL_STATE);
      const { result } = renderOrderedTiles(hookProps(participants), { store });
      expect(result.current.orderedTiles).toEqual(
        participants.map((participant) => ({
          participant,
          connectionIdentifier: participant.identity,
          source: Track.Source.Camera,
          tileKey: participant.identity,
        }))
      );
    });

    it('adds a screen share tile right before the camera tile of a sharing participant', () => {
      const participants = getMockedParticipants(3);
      participants[1].isScreenShareEnabled = true;
      const { store } = configureStore(SHARED_INITIAL_STATE);
      const { result } = renderOrderedTiles(hookProps(participants), { store });
      expect(result.current.orderedTiles.map(({ tileKey, source }) => ({ tileKey, source }))).toEqual([
        { tileKey: participants[0].identity, source: Track.Source.Camera },
        { tileKey: `${participants[1].identity}:screen`, source: Track.Source.ScreenShare },
        { tileKey: participants[1].identity, source: Track.Source.Camera },
        { tileKey: participants[2].identity, source: Track.Source.Camera },
      ]);
      expect(result.current.orderedTiles[1].participant).toBe(participants[1]);
    });

    it('produces unique tile keys with multiple sharing participants', () => {
      const participants = getMockedParticipants(4);
      participants[0].isScreenShareEnabled = true;
      participants[3].isScreenShareEnabled = true;
      const { store } = configureStore(SHARED_INITIAL_STATE);
      const { result } = renderOrderedTiles(hookProps(participants), { store });
      const tileKeys = result.current.orderedTiles.map((tile) => tile.tileKey);
      expect(tileKeys).toHaveLength(6);
      // Keys are unique
      expect(new Set(tileKeys).size).toBe(6);
    });

    it('counts the screen share tile against the page size', () => {
      const participants = getMockedParticipants(9);
      participants[2].isScreenShareEnabled = true;
      const { store } = configureStore(SHARED_INITIAL_STATE);
      const { result } = renderOrderedTiles(hookProps(participants), { store });
      expect(result.current.pageTiles).toHaveLength(9);
      expect(result.current.orderedTiles).toHaveLength(10);
    });
  });
});
