// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ConnectionId } from '../types';
import { configureStore, mockedParticipant, mockStore, renderHookWithProviders } from '../utils/testUtils';
import { useGridPageCount } from './useGridPageCount';

const useRemoteParticipantsMock = vi.fn();
vi.mock('@livekit/components-react', () => ({
  useRemoteParticipants: () => useRemoteParticipantsMock(),
}));

const mockUseConferenceUiVersion = vi.fn();
vi.mock('./useConferenceUiVersion', () => ({
  __esModule: true,
  default: () => mockUseConferenceUiVersion(),
}));

const useGridPageSizeMock = vi.fn();
vi.mock('./useGridPageSize', () => ({
  useGridPageSize: () => useGridPageSizeMock(),
}));

const mockScreenShares = (sharingIndices: number[], participantCount = Math.max(0, ...sharingIndices) + 1) => {
  useRemoteParticipantsMock.mockReturnValue(
    Array.from({ length: participantCount }, (_, index) => ({
      identity: mockedParticipant(index).identity,
      isScreenShareEnabled: sharingIndices.includes(index),
    }))
  );
};

describe('useGridPageCount', () => {
  const renderPageCount = (participantCount: number) => {
    const { store } = mockStore(participantCount);
    return renderHookWithProviders(() => useGridPageCount(), { store });
  };

  beforeEach(() => {
    mockUseConferenceUiVersion.mockReturnValue({ isV2: true });
    useRemoteParticipantsMock.mockReturnValue([]);
    useGridPageSizeMock.mockReturnValue(9);
  });

  it('returns 0 pages when there are no connections', () => {
    const { result } = renderPageCount(0);
    expect(result.current).toBe(0);
  });

  it.each([
    { connections: 1, pageSize: 9, expected: 1 },
    { connections: 9, pageSize: 9, expected: 1 },
    { connections: 10, pageSize: 9, expected: 2 },
  ])(
    'returns $expected pages for $connections connections with page size $pageSize',
    ({ connections, pageSize, expected }) => {
      useGridPageSizeMock.mockReturnValue(pageSize);
      const { result } = renderPageCount(connections);
      expect(result.current).toBe(expected);
    }
  );

  it('counts connections rather than participants', () => {
    useGridPageSizeMock.mockReturnValue(1);
    const participant = mockedParticipant(0);
    const { store } = configureStore({
      initialState: {
        participants: {
          ids: [participant.id],
          entities: {
            [participant.id]: {
              ...participant,
              connections: [...participant.connections, '10000000-e6b4-4759-0099' as ConnectionId],
            },
          },
        },
      },
    });
    const { result } = renderHookWithProviders(() => useGridPageCount(), { store });
    expect(result.current).toBe(2);
  });

  it('adds a tile for every screen share in V2', () => {
    useGridPageSizeMock.mockReturnValue(2);
    mockScreenShares([0], 2);
    const { result } = renderPageCount(2);
    expect(result.current).toBe(2);
  });

  it('does not add a tile for screen shares in V1', () => {
    mockUseConferenceUiVersion.mockReturnValue({ isV2: false });
    useGridPageSizeMock.mockReturnValue(2);
    mockScreenShares([0], 2);
    const { result } = renderPageCount(2);
    expect(result.current).toBe(1);
  });

  it('recalculates when a screen share starts', () => {
    useGridPageSizeMock.mockReturnValue(2);
    mockScreenShares([], 2);
    const { result, rerender } = renderPageCount(2);
    expect(result.current).toBe(1);
    mockScreenShares([1], 2);
    rerender();
    expect(result.current).toBe(2);
  });

  it('recalculates when the page size changes', () => {
    const { result, rerender } = renderPageCount(20);
    expect(result.current).toBe(3);
    useGridPageSizeMock.mockReturnValue(24);
    rerender();
    expect(result.current).toBe(1);
  });
});
