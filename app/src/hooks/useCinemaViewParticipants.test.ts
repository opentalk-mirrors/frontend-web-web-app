// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { act } from '@testing-library/react';
import { range } from 'es-toolkit';
import { Participant as LivekitParticipant, Track } from 'livekit-client';

import { CinemaViewSortOrder } from '../store/slices/common';
import { leave } from '../store/slices/participantsSlice';
import { initialState as initialUiState, setPaginationPage, updatedCinemaViewSortOrder } from '../store/slices/uiSlice';
import { ConnectionId, ConnectionIdentifier, ParticipationKind, Role, Timestamp } from '../types';
import { shuffleArrayItems } from '../utils/arrayUtils';
import { constructConnectionIdentifier } from '../utils/constructConnectionIdentifier';
import { mockedLivekitParticipant, mockedParticipant, mockStore, renderHookWithProviders } from '../utils/testUtils';
import { CinemaViewParticipant, useCinemaViewParticipants } from './useCinemaViewParticipants';
import { useOrderedTiles } from './useOrderedTiles';
import { DEFAULT_THRESHOLD_MS } from './useThresholdSpeaker';

const mockUseRemoteParticipants = vi.fn();
type SortedParticipant = Pick<LivekitParticipant, 'identity' | 'lastSpokeAt'>;
const mockUseSortedParticipants = vi.fn<(participants: SortedParticipant[]) => SortedParticipant[]>(() => []);
vi.mock('@livekit/components-react', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('@livekit/components-react');

  return {
    ...actual,
    useSortedParticipants: (participants: LivekitParticipant[]) => mockUseSortedParticipants(participants),
    useRemoteParticipants: () => mockUseRemoteParticipants(),
  };
});

vi.mock('./useMediaQuery', () => ({ useIsMobile: () => false }));

const mockedRemoteParticipants = (total: number, usersWithCameraOn = 0) => {
  const participants = range(total).map((id) => {
    const base = mockedParticipant(id);
    return {
      ...base,
      // Align identity with connection identifier for remote participant mapping in hook
      identity: base.identity,
      isCameraEnabled: id < usersWithCameraOn,
    };
  });
  return shuffleArrayItems(participants);
};

describe('useCinemaViewParticipants hook', () => {
  describe('shared controller membership', () => {
    const remoteParticipants = [mockedLivekitParticipant(0), mockedLivekitParticipant(1)];
    const leaveRoom = (index: number) =>
      leave({
        id: mockedParticipant(index).id,
        connection: mockedParticipant(index).connections[0],
        timestamp: new Date().toISOString() as Timestamp,
      });

    beforeEach(() => {
      mockUseRemoteParticipants.mockReturnValue(remoteParticipants);
      mockUseSortedParticipants.mockImplementation((participants) => participants);
    });

    it('removes a departed connection from both the tiles and featured speaker before LiveKit disconnects', () => {
      const { store } = mockStore(2);
      const { result } = renderHookWithProviders(() => useCinemaViewParticipants(), { store });
      expect(result.current.featuredTile?.connectionIdentifier).toBe(remoteParticipants[0].identity);

      act(() => {
        store.dispatch(leaveRoom(0));
      });

      expect(result.current.cinemaViewParticipants.map(({ id }) => id)).toEqual([mockedParticipant(1).id]);
      expect(result.current.featuredTile).toEqual({
        connectionIdentifier: remoteParticipants[1].identity,
        source: Track.Source.Camera,
      });
      expect(result.current.remoteParticipantsMap.has(remoteParticipants[0].identity)).toBe(true);
    });

    it('clears the featured tile when the last controller participant leaves', () => {
      const { store } = mockStore(1);
      const { result } = renderHookWithProviders(() => useCinemaViewParticipants(), { store });
      expect(result.current.featuredTile?.connectionIdentifier).toBe(remoteParticipants[0].identity);

      act(() => {
        store.dispatch(leaveRoom(0));
      });

      expect(result.current.cinemaViewParticipants).toEqual([]);
      expect(result.current.featuredTile).toBeUndefined();
    });

    it('keeps another connection of the same participant when the featured connection leaves', () => {
      const participant = mockedParticipant(0);
      const secondConnection = 'second-connection' as ConnectionId;
      const secondIdentity = constructConnectionIdentifier(participant.id, secondConnection);
      const { store } = mockStore(0, {
        store: {
          initialState: {
            participants: {
              ids: [participant.id],
              entities: {
                [participant.id]: { ...participant, connections: [...participant.connections, secondConnection] },
              },
            },
          },
        },
      });
      mockUseRemoteParticipants.mockReturnValue([
        remoteParticipants[0],
        new LivekitParticipant('second-session', secondIdentity),
      ]);
      const { result } = renderHookWithProviders(() => useCinemaViewParticipants(), { store });
      expect(result.current.cinemaViewParticipants).toHaveLength(2);
      expect(result.current.featuredTile?.connectionIdentifier).toBe(remoteParticipants[0].identity);

      act(() => {
        store.dispatch(leaveRoom(0));
      });

      expect(result.current.cinemaViewParticipants).toEqual([
        expect.objectContaining({ id: participant.id, connections: [secondConnection] }),
      ]);
      expect(result.current.featuredTile?.connectionIdentifier).toBe(secondIdentity);
    });

    it('switches immediately from a pinned screen share when its controller connection leaves', () => {
      const { store } = mockStore(2, {
        store: {
          initialState: {
            ui: {
              pinnedTile: {
                connectionIdentifier: remoteParticipants[1].identity as ConnectionIdentifier,
                source: Track.Source.ScreenShare,
              },
            },
          },
        },
      });
      const { result } = renderHookWithProviders(() => useCinemaViewParticipants(), { store });
      expect(result.current.featuredTile?.source).toBe(Track.Source.ScreenShare);

      act(() => {
        store.dispatch(leaveRoom(1));
      });

      expect(result.current.featuredTile).toEqual({
        connectionIdentifier: remoteParticipants[0].identity,
        source: Track.Source.Camera,
      });
    });

    it('keeps controller participants available before LiveKit media initialization', () => {
      mockUseRemoteParticipants.mockReturnValue([]);
      const { store } = mockStore(2);
      const { result } = renderHookWithProviders(() => useCinemaViewParticipants(), { store });

      expect(result.current.cinemaViewParticipants.map(({ id }) => id)).toEqual([
        mockedParticipant(0).id,
        mockedParticipant(1).id,
      ]);
      expect(result.current.featuredTile).toBeUndefined();
      expect(result.current.remoteParticipantsMap.size).toBe(0);
    });
  });

  describe('sort order: join time', () => {
    mockUseRemoteParticipants.mockImplementation(() => mockedRemoteParticipants(10));
    const { store } = mockStore(10, {
      randomizeJoinTime: true,
      store: {
        initialState: {
          ui: { cinemaViewOrder: CinemaViewSortOrder.FirstJoined },
        },
      },
    });

    const { result } = renderHookWithProviders(() => useCinemaViewParticipants(), { store });
    const { cinemaViewParticipants } = result.current;

    it('should return participants sorted by join time', () => {
      range(8).forEach((index) => {
        const firstParticipantJoinTime = new Date(cinemaViewParticipants[index].joinedAt).getTime();
        const secondParticipantJoinTime = new Date(cinemaViewParticipants[index + 1].joinedAt).getTime();
        expect(firstParticipantJoinTime).toBeLessThanOrEqual(secondParticipantJoinTime);
      });
    });
  });

  describe('sort order: cameras first', () => {
    mockUseRemoteParticipants.mockImplementation(() => mockedRemoteParticipants(10, 3));
    const { store } = mockStore(10, {
      randomizeJoinTime: true,
    });

    const { result } = renderHookWithProviders(() => useCinemaViewParticipants(), { store });
    const { cinemaViewParticipants } = result.current;
    const enabledCameraCount = cinemaViewParticipants.reduce((sum, p) => sum + (p.isCameraEnabled ? 1 : 0), 0);

    it('should return participants sorted by active cameras first (default option)', () => {
      expect(enabledCameraCount).toBe(3);
      expect(cinemaViewParticipants[enabledCameraCount - 1].isCameraEnabled).toBe(true);
      expect(cinemaViewParticipants[enabledCameraCount - 1]).not.toEqual(cinemaViewParticipants[enabledCameraCount]);
    });
  });

  describe('sort order: moderators first', () => {
    enum Group {
      Moderator,
      WithAccount,
      WithoutAccount,
    }
    const groupOf = (participant: CinemaViewParticipant) => {
      if (participant.role === Role.Moderator) {
        return Group.Moderator;
      }
      return participant.participationKind === ParticipationKind.Registered ? Group.WithAccount : Group.WithoutAccount;
    };

    // Uninvited participants with an account have the guest role but belong to the participants with an account.
    // The participants are stored in reverse of the expected order with equal join times, so the join time
    // tiebreaker cannot produce the expected order by chance.
    const mockedParticipants = [
      ...range(3).map(() => ({ role: Role.Guest, kind: ParticipationKind.Unregistered })),
      ...range(3).map(() => ({ role: Role.Guest, kind: ParticipationKind.Registered })),
      ...range(2).map(() => ({ role: Role.User, kind: ParticipationKind.Registered })),
      ...range(2).map(() => ({ role: Role.Moderator, kind: ParticipationKind.Registered })),
    ];
    mockUseRemoteParticipants.mockImplementation(() => mockedRemoteParticipants(10));
    const { store } = mockStore(10, {
      role: mockedParticipants.map(({ role }) => role),
      participantKinds: mockedParticipants.map(({ kind }) => kind),
      store: {
        initialState: {
          ui: { cinemaViewOrder: CinemaViewSortOrder.ModeratorsFirst },
        },
      },
    });

    const { result } = renderHookWithProviders(() => useCinemaViewParticipants(), { store });
    const { cinemaViewParticipants } = result.current;

    it('should sort moderators first, participants with an account next and participants without one last', () => {
      expect(cinemaViewParticipants.map(groupOf)).toEqual([
        ...range(2).map(() => Group.Moderator),
        ...range(5).map(() => Group.WithAccount),
        ...range(3).map(() => Group.WithoutAccount),
      ]);
    });
  });

  describe('live activity ordering', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-06-01T09:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
      mockUseSortedParticipants.mockReturnValue([]);
    });

    const setupOrdering = (
      count: number,
      cinemaViewOrder = CinemaViewSortOrder.ActivityFirst,
      unbounded = false,
      cinemaGridSize = 9
    ) => {
      const participants = range(count).map((index) => ({
        ...mockedParticipant(index),
        lastSpokeAt: undefined as Date | undefined,
        isSpeaking: false,
      }));
      mockUseRemoteParticipants.mockReturnValue(participants);
      mockUseSortedParticipants.mockReturnValue([participants[0]]);
      const { store } = mockStore(count, {
        store: { initialState: { ui: { ...initialUiState, cinemaGridSize, cinemaViewOrder, paginationPage: 1 } } },
      });
      const view = renderHookWithProviders(
        () => {
          const merged = useCinemaViewParticipants();
          const featuredConnectionIdentifier = merged.featuredTile?.connectionIdentifier;
          const { pageTiles, orderedTiles } = useOrderedTiles(merged.cinemaViewParticipants, {
            unbounded,
            featuredConnectionIdentifier,
          });
          return {
            ...merged,
            currentSpeakerId: featuredConnectionIdentifier,
            pageParticipants: pageTiles.map((tile) => tile.participant),
            orderedParticipants: orderedTiles.map((tile) => tile.participant),
          };
        },
        { store }
      );

      const setSpeaker = (index: number) => {
        participants.forEach((participant, participantIndex) => {
          participant.isSpeaking = participantIndex === index;
        });
        participants[index].lastSpokeAt = new Date();
        mockUseSortedParticipants.mockReturnValue([participants[index]]);
        mockUseRemoteParticipants.mockReturnValue([...participants]);
        view.rerender();
      };

      const setCamera = (index: number, enabled: boolean) => {
        participants[index].isCameraEnabled = enabled;
        mockUseRemoteParticipants.mockReturnValue([...participants]);
        view.rerender();
      };

      return { ...view, participants, store, setSpeaker, setCamera };
    };

    const advanceTime = (milliseconds: number) => {
      act(() => {
        vi.advanceTimersByTime(milliseconds);
      });
    };

    it('replaces the oldest silent fallback when a later participant enables their camera', () => {
      const { result, participants, setCamera } = setupOrdering(3, CinemaViewSortOrder.ActivityFirst, false, 2);
      expect(result.current.currentSpeakerId).toBe(participants[0].identity);
      expect(result.current.pageParticipants.map(({ id }) => id)).toEqual([participants[0].id, participants[1].id]);

      advanceTime(1000);
      setCamera(2, true);
      expect(result.current.currentSpeakerId).toBe(participants[0].identity);
      expect(result.current.orderedParticipants.map(({ id }) => id)).toEqual([
        participants[2].id,
        participants[1].id,
        participants[0].id,
      ]);
    });

    it('protects qualified speech but releases the featured fallback when speech stops', () => {
      const { result, participants, setSpeaker, setCamera, rerender } = setupOrdering(
        3,
        CinemaViewSortOrder.ActivityFirst,
        false,
        2
      );
      advanceTime(1000);
      setSpeaker(0);
      advanceTime(DEFAULT_THRESHOLD_MS);
      advanceTime(1000);
      setCamera(1, true);
      advanceTime(1000);
      setCamera(2, true);
      expect(result.current.orderedParticipants.map(({ id }) => id)).toEqual([
        participants[0].id,
        participants[2].id,
        participants[1].id,
      ]);

      participants[0].isSpeaking = false;
      mockUseRemoteParticipants.mockReturnValue([...participants]);
      rerender();
      setCamera(1, false);
      advanceTime(1000);
      setCamera(1, true);
      expect(result.current.currentSpeakerId).toBe(participants[0].identity);
      expect(result.current.orderedParticipants.map(({ id }) => id)).toEqual([
        participants[1].id,
        participants[2].id,
        participants[0].id,
      ]);
    });

    it.each([false, true])(
      'ignores short noise and promotes speech only after the threshold (unbounded: %s)',
      (unbounded) => {
        const { result, participants, setSpeaker } = setupOrdering(10, CinemaViewSortOrder.ActivityFirst, unbounded);
        advanceTime(1000);
        setSpeaker(0);
        const initialOrder = result.current.orderedParticipants.map((participant) => participant.id);

        advanceTime(1000);
        setSpeaker(9);
        advanceTime(DEFAULT_THRESHOLD_MS / 3);
        expect(result.current.currentSpeakerId).toBe(participants[0].identity);
        expect(result.current.orderedParticipants.map((participant) => participant.id)).toEqual(initialOrder);
        expect(
          result.current.cinemaViewParticipants.find((participant) => participant.id === participants[9].id)
        ).toHaveProperty('lastSpokeAt', undefined);

        setSpeaker(0);
        advanceTime(DEFAULT_THRESHOLD_MS);
        expect(result.current.orderedParticipants.map((participant) => participant.id)).toEqual(initialOrder);

        advanceTime(1000);
        setSpeaker(9);
        advanceTime(DEFAULT_THRESHOLD_MS - 1);
        expect(result.current.orderedParticipants.map((participant) => participant.id)).toEqual(initialOrder);

        advanceTime(1);
        expect(result.current.currentSpeakerId).toBe(participants[9].identity);
        const expectedOrder = unbounded
          ? [participants[9].id, ...initialOrder.slice(0, 9)]
          : [initialOrder[0], participants[9].id, ...initialOrder.slice(2, 9), initialOrder[1]];
        expect(result.current.orderedParticipants.map((participant) => participant.id)).toEqual(expectedOrder);
        expect(result.current.pageParticipants.map((participant) => participant.id)).toEqual(expectedOrder.slice(0, 9));
        expect(result.current.orderedParticipants).toHaveLength(10);
      }
    );

    it('keeps qualified history when a previous speaker makes a new short noise', () => {
      const { result, participants, setSpeaker } = setupOrdering(3);
      advanceTime(1000);
      setSpeaker(2);
      advanceTime(DEFAULT_THRESHOLD_MS);
      const qualifiedAt = result.current.pageParticipants.find(
        (participant) => participant.id === participants[2].id
      )?.lastSpokeAt;
      expect(qualifiedAt).toEqual(participants[2].lastSpokeAt);
      const initialOrder = result.current.pageParticipants.map((participant) => participant.id);

      advanceTime(1000);
      setSpeaker(1);
      advanceTime(DEFAULT_THRESHOLD_MS);
      expect(result.current.currentSpeakerId).toBe(participants[1].identity);
      expect(result.current.pageParticipants.map((participant) => participant.id)).toEqual(initialOrder);

      advanceTime(1000);
      setSpeaker(2);
      advanceTime(DEFAULT_THRESHOLD_MS / 3);
      expect(result.current.currentSpeakerId).toBe(participants[1].identity);
      expect(result.current.pageParticipants.map((participant) => participant.id)).toEqual(initialOrder);
      expect(
        result.current.pageParticipants.find((participant) => participant.id === participants[2].id)
      ).toHaveProperty('lastSpokeAt', qualifiedAt);
    });

    it('keeps visible tiles stable through camera toggles and qualified speech', () => {
      const { result, participants, setSpeaker, setCamera, rerender } = setupOrdering(5);
      const initialOrder = result.current.pageParticipants.map((participant) => participant.id);
      for (const index of range(5).reverse()) {
        advanceTime(1000);
        setSpeaker(index);
        advanceTime(DEFAULT_THRESHOLD_MS);
      }
      expect(result.current.pageParticipants.map((participant) => participant.id)).toEqual(initialOrder);

      advanceTime(1000);
      setCamera(4, true);
      expect(result.current.pageParticipants.map((participant) => participant.id)).toEqual(initialOrder);

      advanceTime(1000);
      setSpeaker(1);
      advanceTime(DEFAULT_THRESHOLD_MS);
      expect(result.current.currentSpeakerId).toBe(participants[1].identity);
      expect(result.current.pageParticipants.map((participant) => participant.id)).toEqual(initialOrder);

      advanceTime(5000);
      rerender();
      expect(result.current.pageParticipants.map((participant) => participant.id)).toEqual(initialOrder);

      setCamera(4, false);
      expect(result.current.pageParticipants.map((participant) => participant.id)).toEqual(initialOrder);
      advanceTime(1000);
      setCamera(4, true);
      expect(result.current.pageParticipants.map((participant) => participant.id)).toEqual(initialOrder);
    });

    it('follows live camera updates in VideoFirst without activity reconciliation', () => {
      const { result, participants, setCamera } = setupOrdering(5, CinemaViewSortOrder.VideoFirst);
      setCamera(4, true);
      expect(result.current.pageParticipants[0].id).toBe(participants[4].id);

      setCamera(4, false);
      expect(result.current.pageParticipants.map((participant) => participant.id)).toEqual(
        participants.map((participant) => participant.id)
      );
    });

    it('uses camera-first order when selecting Activity despite more recent speech', () => {
      const { result, participants, store, setSpeaker, setCamera } = setupOrdering(5, CinemaViewSortOrder.VideoFirst);
      setCamera(4, true);
      advanceTime(1000);
      setSpeaker(1);
      advanceTime(DEFAULT_THRESHOLD_MS);

      act(() => {
        store.dispatch(updatedCinemaViewSortOrder(CinemaViewSortOrder.ActivityFirst));
      });

      expect(result.current.currentSpeakerId).toBe(participants[1].identity);
      expect(result.current.pageParticipants.map((participant) => participant.id)).toEqual([
        participants[4].id,
        ...participants.slice(0, 4).map((participant) => participant.id),
      ]);
    });

    it('defers activity reordering while browsing page 2 until returning to page 1', () => {
      const { result, participants, store, setCamera } = setupOrdering(10);
      act(() => {
        store.dispatch(setPaginationPage(2));
      });
      const initialOrder = result.current.orderedParticipants.map((participant) => participant.id);
      advanceTime(1000);
      setCamera(9, true);
      expect(result.current.orderedParticipants.map((participant) => participant.id)).toEqual(initialOrder);
      expect(result.current.pageParticipants.map((participant) => participant.id)).toEqual([participants[9].id]);

      act(() => {
        store.dispatch(setPaginationPage(1));
      });
      expect(result.current.orderedParticipants.map((participant) => participant.id)).toEqual([
        participants[9].id,
        ...initialOrder.slice(1, 9),
        initialOrder[0],
      ]);
    });
  });
});
