// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { act } from '@testing-library/react';
import type { Participant } from 'livekit-client';
import { Track } from 'livekit-client';

import { setPinnedTile } from '../store/slices/uiSlice';
import { ConnectionIdentifier, TileIdentifier } from '../types';
import { mockedLivekitParticipant, mockStore, renderHookWithProviders } from '../utils/testUtils';
import { useFeaturedTile } from './useFeaturedTile';
import { DEFAULT_THRESHOLD_MS } from './useThresholdSpeaker';

const { mockUseSortedParticipants } = vi.hoisted(() => ({
  mockUseSortedParticipants: vi.fn<(participants: Participant[]) => Participant[]>(),
}));

vi.mock('@livekit/components-react', () => ({
  useSortedParticipants: (participants: Participant[]) => mockUseSortedParticipants(participants),
}));

const identityOf = (index: number) => mockedLivekitParticipant(index).identity as ConnectionIdentifier;

describe('useFeaturedTile', () => {
  const remoteParticipants = [mockedLivekitParticipant(0), mockedLivekitParticipant(1), mockedLivekitParticipant(2)];
  const participantIds = new Set(remoteParticipants.map(({ identity }) => identity as ConnectionIdentifier));

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mockUseSortedParticipants.mockImplementation((participants: Participant[]) => participants);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('features the camera of the active speaker', () => {
    const { store } = mockStore(0);
    const { result } = renderHookWithProviders(() => useFeaturedTile(remoteParticipants, participantIds), { store });

    expect(result.current.featuredTile).toEqual({
      connectionIdentifier: identityOf(0),
      source: Track.Source.Camera,
    });
  });

  it('switches immediately when a connection leaves the shared membership while LiveKit sorting is stale', () => {
    mockUseSortedParticipants.mockReturnValue(remoteParticipants);
    const { store } = mockStore(0);
    const { result, rerender } = renderHookWithProviders(
      ({ participantIds }) => useFeaturedTile(remoteParticipants, participantIds),
      { store, options: { initialProps: { participantIds } } }
    );
    expect(result.current.featuredTile?.connectionIdentifier).toBe(identityOf(0));

    rerender({ participantIds: new Set([identityOf(1), identityOf(2)]) });

    expect(result.current.featuredTile).toEqual({
      connectionIdentifier: identityOf(1),
      source: Track.Source.Camera,
    });
  });

  it('clears the featured tile immediately when no connections remain', () => {
    const { store } = mockStore(0);
    const { result, rerender } = renderHookWithProviders(
      ({ participantIds }) => useFeaturedTile(remoteParticipants, participantIds),
      { store, options: { initialProps: { participantIds: new Set([identityOf(0)]) } } }
    );
    expect(result.current.featuredTile?.connectionIdentifier).toBe(identityOf(0));

    rerender({ participantIds: new Set() });

    expect(result.current.featuredTile).toBeUndefined();
  });

  it('does not feature a LiveKit participant outside the shared membership', () => {
    const { store } = mockStore(0);
    const { result } = renderHookWithProviders(() => useFeaturedTile(remoteParticipants, new Set()), { store });

    expect(result.current.featuredTile).toBeUndefined();
  });

  it('keeps the threshold for normal speaker changes', () => {
    const { store } = mockStore(0);
    const { result, rerender } = renderHookWithProviders(() => useFeaturedTile(remoteParticipants, participantIds), {
      store,
    });

    mockUseSortedParticipants.mockReturnValue([remoteParticipants[1], remoteParticipants[0], remoteParticipants[2]]);
    rerender();

    act(() => {
      vi.advanceTimersByTime(DEFAULT_THRESHOLD_MS - 1);
    });
    expect(result.current.featuredTile?.connectionIdentifier).toBe(identityOf(0));

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.featuredTile?.connectionIdentifier).toBe(identityOf(1));
  });

  it.each([Track.Source.Camera, Track.Source.ScreenShare] as const)('features a pinned %s immediately', (source) => {
    const { store } = mockStore(0);
    const { result } = renderHookWithProviders(() => useFeaturedTile(remoteParticipants, participantIds), { store });
    const pinnedTile: TileIdentifier = { connectionIdentifier: identityOf(2), source };

    act(() => {
      store.dispatch(setPinnedTile(pinnedTile));
    });

    expect(result.current.featuredTile).toEqual(pinnedTile);
  });

  it('can pin a controller connection before its LiveKit media is ready', () => {
    const { store } = mockStore(0);
    const { result } = renderHookWithProviders(() => useFeaturedTile([], participantIds), { store });
    const pinnedTile: TileIdentifier = { connectionIdentifier: identityOf(0), source: Track.Source.Camera };

    act(() => {
      store.dispatch(setPinnedTile(pinnedTile));
    });

    expect(result.current.featuredTile).toEqual(pinnedTile);
  });
});
