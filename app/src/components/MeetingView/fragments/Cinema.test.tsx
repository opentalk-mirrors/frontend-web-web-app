// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { RoomId } from '@opentalk/rest-api-rtk-query';
import { act, screen, waitFor } from '@testing-library/react';
import { Mock } from 'vitest';

import LayoutOptions from '../../../enums/LayoutOptions';
import type { CinemaViewParticipant } from '../../../hooks/useCinemaViewParticipants';
import useConferenceUiVersion from '../../../hooks/useConferenceUiVersion';
import { DEFAULT_THRESHOLD_MS } from '../../../hooks/useThresholdSpeaker';
import { startRoom } from '../../../store/commonActions';
import { CinemaViewSortOrder } from '../../../store/slices/common';
import { fullscreenActions } from '../../../store/slices/fullscreen/slice';
import { setLivekitUnavailable } from '../../../store/slices/livekitSlice';
import { actions as uiActions, initialState as initialUiState } from '../../../store/slices/uiSlice';
import { BreakoutRoomId, TileIdentifier } from '../../../types';
import { configureStore, mockedParticipant, mockStore, renderWithProviders } from '../../../utils/testUtils';
import Cinema from './Cinema';

const { remoteParticipantsMock, sortedParticipantsMock, livekitUpdates } = vi.hoisted(() => ({
  remoteParticipantsMock: vi.fn(),
  sortedParticipantsMock: vi.fn(),
  livekitUpdates: { version: 0, listeners: new Set<() => void>() },
}));

vi.mock('../../../hooks/useConferenceUiVersion', () => ({
  __esModule: true,
  default: vi.fn(),
}));

vi.mock('./SelfView', () => ({
  __esModule: true,
  default: () => <div data-testid="self-view" />,
}));

vi.mock('../../FullscreenView', () => ({
  __esModule: true,
  default: () => <div data-testid="fullscreen-view" />,
}));

vi.mock('../../GridView', () => ({
  __esModule: true,
  default: ({ pageTiles }: { pageTiles: Array<{ participant: CinemaViewParticipant }> }) => (
    <div data-testid="grid-view" data-order={JSON.stringify(pageTiles.map((tile) => tile.participant.id))} />
  ),
}));

vi.mock('../../SpeakerView', async () => {
  const { useOrderedTiles } = await import('../../../hooks/useOrderedTiles');
  return {
    __esModule: true,
    default: function SpeakerViewStub({
      cinemaViewParticipants,
      featuredTile,
    }: {
      cinemaViewParticipants: CinemaViewParticipant[];
      featuredTile?: TileIdentifier;
    }) {
      const { orderedTiles } = useOrderedTiles(cinemaViewParticipants, { unbounded: true });
      return (
        <div
          data-testid="speaker-view"
          data-order={JSON.stringify(orderedTiles.map((tile) => tile.participant.id))}
          data-featured={featuredTile?.connectionIdentifier}
        />
      );
    },
  };
});

vi.mock('../../WhiteboardView', () => ({
  __esModule: true,
  default: () => <div data-testid="whiteboard-view" />,
}));

vi.mock('../../MeetingNotesView', () => ({
  __esModule: true,
  default: () => <div data-testid="meeting-notes-view" />,
}));

vi.mock('./MediaReconnectionDialog', () => ({
  __esModule: true,
  default: () => <div data-testid="media-reconnection-dialog" />,
}));
vi.mock('@livekit/components-react', async () => {
  const { useSyncExternalStore } = await import('react');
  const subscribe = (listener: () => void) => {
    livekitUpdates.listeners.add(listener);
    return () => livekitUpdates.listeners.delete(listener);
  };
  return {
    useRemoteParticipants: function useMockRemoteParticipants() {
      useSyncExternalStore(subscribe, () => livekitUpdates.version);
      return remoteParticipantsMock();
    },
    useSortedParticipants: sortedParticipantsMock,
  };
});

describe('Cinema', () => {
  beforeEach(() => {
    (useConferenceUiVersion as Mock).mockReturnValue({ isV2: false });
    sortedParticipantsMock.mockReturnValue([]);
    remoteParticipantsMock.mockReturnValue(
      Array.from({ length: 6 }, (_, index) => ({
        ...mockedParticipant(index),
      }))
    );
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders self view if V2 ui is selected', () => {
    const { store } = configureStore();
    (useConferenceUiVersion as Mock).mockReturnValue({ isV2: true });
    renderWithProviders(<Cinema />, { store, provider: { mui: true } });
    expect(screen.getByTestId('self-view')).toBeInTheDocument();
  });

  it('does not render self view if V1 ui is selected', () => {
    const { store } = configureStore();
    (useConferenceUiVersion as Mock).mockReturnValue({ isV2: false });
    renderWithProviders(<Cinema />, { store, provider: { mui: true } });
    expect(screen.queryByTestId('self-view')).not.toBeInTheDocument();
  });

  it.each([
    { version: 'V1', isV2: false, isSelfViewMinimized: false, paddingRight: '' },
    { version: 'V1', isV2: false, isSelfViewMinimized: true, paddingRight: '' },
    { version: 'V2', isV2: true, isSelfViewMinimized: false, paddingRight: '120px' },
    { version: 'V2', isV2: true, isSelfViewMinimized: true, paddingRight: '' },
  ])(
    'applies "$paddingRight" grid right padding in $version with minimized=$isSelfViewMinimized',
    ({ isV2, isSelfViewMinimized, paddingRight }) => {
      const { store } = configureStore({
        initialState: { ui: { cinemaLayout: LayoutOptions.Grid, isSelfViewMinimized } },
      });
      (useConferenceUiVersion as Mock).mockReturnValue({ isV2 });
      renderWithProviders(<Cinema />, { store, provider: { mui: true } });

      expect(getComputedStyle(screen.getByRole('main')).paddingRight).toBe(paddingRight);
    }
  );

  it('does not reserve self-view space for the V2 grid in fullscreen', () => {
    const { store } = configureStore({
      initialState: { ui: { cinemaLayout: LayoutOptions.Grid, isSelfViewMinimized: false } },
    });
    (useConferenceUiVersion as Mock).mockReturnValue({ isV2: true });
    store.dispatch(fullscreenActions.changed({ active: true }));
    renderWithProviders(<Cinema />, { store, provider: { mui: true } });

    expect(screen.getByTestId('fullscreen-view')).toBeInTheDocument();
    expect(getComputedStyle(screen.getByRole('main')).paddingRight).toBe('');
  });

  it('dispatches fullscreen element on mount and clears it on unmount', async () => {
    const { store, dispatchSpy } = configureStore();
    (useConferenceUiVersion as Mock).mockReturnValue({ isV2: true });
    const { unmount } = renderWithProviders(<Cinema />, { store, provider: { mui: true } });

    await waitFor(() => {
      const setElementCall = dispatchSpy.mock.calls.find(([action]) => {
        const typedAction = action as ReturnType<typeof fullscreenActions.setElement>;
        return typedAction.type === fullscreenActions.setElement.type && Boolean(typedAction.payload?.element);
      })?.[0] as ReturnType<typeof fullscreenActions.setElement> | undefined;

      expect(setElementCall?.payload?.element).toBeInstanceOf(HTMLElement);
    });

    dispatchSpy.mockClear();

    unmount();

    expect(dispatchSpy).toHaveBeenCalledWith(fullscreenActions.setElement({ element: undefined }));
  });

  it('renders fullscreen view when fullscreen mode is active regardless of layout', () => {
    const { store } = configureStore();
    (useConferenceUiVersion as Mock).mockReturnValue({ isV2: true });
    store.dispatch(uiActions.updatedCinemaLayout({ layout: LayoutOptions.Speaker }));
    store.dispatch(fullscreenActions.changed({ active: true }));

    renderWithProviders(<Cinema />, { store, provider: { mui: true } });

    expect(screen.getByTestId('fullscreen-view')).toBeInTheDocument();
    expect(screen.queryByTestId('speaker-view')).not.toBeInTheDocument();
  });

  it('renders media reconnection dialog when livekit is unavailable', () => {
    const { store } = configureStore();
    (useConferenceUiVersion as Mock).mockReturnValue({ isV2: true });
    store.dispatch(setLivekitUnavailable(true));

    renderWithProviders(<Cinema />, { store, provider: { mui: true } });

    expect(screen.getByTestId('media-reconnection-dialog')).toBeInTheDocument();
  });

  it.each([
    { layout: LayoutOptions.Speaker, expectedTestId: 'speaker-view' },
    { layout: LayoutOptions.Whiteboard, expectedTestId: 'whiteboard-view' },
    { layout: LayoutOptions.MeetingNotes, expectedTestId: 'meeting-notes-view' },
    { layout: LayoutOptions.Grid, expectedTestId: 'grid-view' },
  ])('renders correct layout for $layout option', ({ layout, expectedTestId }) => {
    const { store } = configureStore();
    store.dispatch(fullscreenActions.changed({ active: false }));
    store.dispatch(uiActions.updatedCinemaLayout({ layout }));

    renderWithProviders(<Cinema />, { store, provider: { mui: true } });

    expect(screen.getByTestId(expectedTestId)).toBeInTheDocument();
  });

  describe('room-scoped activity ordering', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-11-06T10:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    const roomId = 'room-a' as RoomId;
    const orderIn = (layout = 'grid'): string[] =>
      JSON.parse(screen.getByTestId(`${layout}-view`).getAttribute('data-order') ?? '[]');

    const advanceTime = (milliseconds: number = DEFAULT_THRESHOLD_MS) => {
      act(() => {
        vi.advanceTimersByTime(milliseconds);
      });
    };

    const setupOrdering = () => {
      const participants = Array.from({ length: 11 }, (_, index) => ({
        ...mockedParticipant(index),
        lastSpokeAt: undefined as Date | undefined,
        isSpeaking: false,
      }));
      remoteParticipantsMock.mockReturnValue(participants);
      sortedParticipantsMock.mockReturnValue([participants[0]]);
      const { store } = mockStore(participants.length, {
        store: {
          initialState: {
            ui: {
              ...initialUiState,
              cinemaLayout: LayoutOptions.Grid,
              cinemaViewOrder: CinemaViewSortOrder.ActivityFirst,
              cinemaGridSize: 9,
              paginationPage: 1,
            },
          },
        },
      });
      store.dispatch(startRoom.pending('initial-room', { roomId, displayName: 'Viewer' }));
      const view = renderWithProviders(<Cinema />, { store, provider: { mui: true } });
      const setLayout = (layout: LayoutOptions) => {
        act(() => {
          store.dispatch(uiActions.updatedCinemaLayout({ layout }));
        });
      };
      const notifyParticipantsChanged = () => {
        remoteParticipantsMock.mockReturnValue([...participants]);
        act(() => {
          livekitUpdates.version++;
          livekitUpdates.listeners.forEach((listener) => listener());
        });
      };
      const setCamera = (index: number, enabled: boolean) => {
        participants[index].isCameraEnabled = enabled;
        notifyParticipantsChanged();
      };
      const setSpeaker = (index: number) => {
        participants.forEach((participant, participantIndex) => {
          participant.isSpeaking = participantIndex === index;
        });
        participants[index].lastSpokeAt = new Date();
        sortedParticipantsMock.mockReturnValue([participants[index]]);
        notifyParticipantsChanged();
      };
      return { ...view, store, participants, setLayout, setCamera, setSpeaker };
    };

    it.each([LayoutOptions.Speaker, LayoutOptions.Whiteboard, LayoutOptions.MeetingNotes])(
      'preserves a camera-off participant after switching to %s and back',
      (layout) => {
        const { participants, setCamera, setLayout } = setupOrdering();
        advanceTime();
        setCamera(9, true);
        expect(orderIn()).toContain(participants[9].id);
        setCamera(9, false);
        const settled = orderIn();

        setLayout(layout);
        expect(screen.queryByTestId('grid-view')).not.toBeInTheDocument();
        setLayout(LayoutOptions.Grid);
        expect(orderIn()).toEqual(settled);
        setLayout(layout);
        setLayout(LayoutOptions.Grid);
        expect(orderIn()).toEqual(settled);
      }
    );

    it('preserves the grid order across fullscreen without leaving the grid mounted', () => {
      const { participants, store, setCamera } = setupOrdering();
      advanceTime();
      setCamera(9, true);
      setCamera(9, false);
      const settled = orderIn();
      expect(settled).toContain(participants[9].id);

      act(() => {
        store.dispatch(fullscreenActions.changed({ active: true }));
      });
      expect(screen.queryByTestId('grid-view')).not.toBeInTheDocument();
      act(() => {
        store.dispatch(fullscreenActions.changed({ active: false }));
      });
      expect(orderIn()).toEqual(settled);
    });

    it('honors sort changes made in Speaker view instead of restoring an obsolete grid order', () => {
      const { participants, store, setCamera, setLayout } = setupOrdering();
      advanceTime();
      setCamera(9, true);
      setCamera(9, false);
      expect(orderIn()).toContain(participants[9].id);

      setLayout(LayoutOptions.Speaker);
      act(() => {
        store.dispatch(uiActions.updatedCinemaViewSortOrder(CinemaViewSortOrder.FirstJoined));
      });
      setLayout(LayoutOptions.Grid);
      expect(orderIn()).toEqual(participants.slice(0, 9).map(({ id }) => id));
    });

    it('applies new camera activity from Speaker view without replacing the grid snapshot with strip order', () => {
      const { participants, setCamera, setLayout } = setupOrdering();
      advanceTime();
      setCamera(9, true);
      setCamera(9, false);
      const settled = orderIn();
      setLayout(LayoutOptions.Speaker);
      expect(orderIn('speaker').slice(0, 9)).not.toEqual(settled);

      advanceTime();
      setCamera(10, true);
      setCamera(10, false);
      advanceTime();
      setCamera(10, true);
      expect(orderIn('speaker')[0]).toBe(participants[10].id);
      setLayout(LayoutOptions.Grid);
      const expected = [...settled];
      expected[0] = participants[10].id;
      expect(orderIn()).toEqual(expected);
    });

    it('keeps speech history across switches and qualifies new speech while the grid is absent', () => {
      const { participants, setSpeaker, setLayout } = setupOrdering();
      advanceTime();
      setSpeaker(9);
      advanceTime();
      expect(orderIn()[0]).toBe(participants[9].id);

      setLayout(LayoutOptions.Speaker);
      advanceTime();
      setSpeaker(10);
      advanceTime(DEFAULT_THRESHOLD_MS - 1);
      expect(screen.getByTestId('speaker-view')).toHaveAttribute('data-featured', participants[9].identity);
      advanceTime(1);
      expect(screen.getByTestId('speaker-view')).toHaveAttribute('data-featured', participants[10].identity);

      setLayout(LayoutOptions.Grid);
      expect(orderIn()).toEqual([
        participants[9].id,
        participants[10].id,
        ...participants.slice(2, 9).map(({ id }) => id),
      ]);
    });

    it.each(['room', 'breakout', 'unmount'])('clears the old order and speech history on %s', (transition) => {
      const { store, participants, setCamera, setSpeaker, unmount } = setupOrdering();
      advanceTime();
      setCamera(9, true);
      setCamera(9, false);
      setSpeaker(9);
      advanceTime();
      setSpeaker(0);
      advanceTime();
      expect(orderIn()).toContain(participants[9].id);

      if (transition === 'unmount') {
        unmount();
        renderWithProviders(<Cinema />, { store, provider: { mui: true } });
      } else {
        act(() => {
          store.dispatch(
            startRoom.pending('new-room', {
              roomId: transition === 'room' ? ('room-b' as RoomId) : roomId,
              breakoutRoomId: transition === 'breakout' ? (1 as BreakoutRoomId) : undefined,
              displayName: 'Viewer',
            })
          );
        });
        if (transition === 'breakout') {
          act(() => {
            store.dispatch(startRoom.pending('return-main', { roomId, displayName: 'Viewer' }));
          });
        }
      }

      expect(orderIn()).toEqual(participants.slice(0, 9).map(({ id }) => id));
    });
  });
});
