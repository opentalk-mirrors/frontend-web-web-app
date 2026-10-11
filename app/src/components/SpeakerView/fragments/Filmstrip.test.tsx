// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, screen, within } from '@testing-library/react';
import { RemoteParticipant, Track } from 'livekit-client';
import { PropsWithChildren } from 'react';

import type { CinemaViewParticipant } from '../../../hooks/useCinemaViewParticipants';
import type { CinemaViewTile } from '../../../hooks/useOrderedTiles';
import { ConnectionId, ConnectionIdentifier, MediaSessionType, ParticipantId, TileIdentifier } from '../../../types';
import { renderWithProviders } from '../../../utils/testUtils';
import Filmstrip, { FilmstripProps } from './Filmstrip';

const { mockUseOrderedTiles, mockUseConferenceUiVersion } = vi.hoisted(() => ({
  mockUseOrderedTiles: vi.fn(),
  mockUseConferenceUiVersion: vi.fn(),
}));

vi.mock('../../../hooks', () => ({
  useOrderedTiles: (...args: unknown[]) => mockUseOrderedTiles(...args),
  useConferenceUiVersion: () => mockUseConferenceUiVersion(),
}));

interface MockTileParticipantProviderProps {
  connectionIdentifier: ConnectionIdentifier;
  displayName: string;
  remoteParticipant?: RemoteParticipant;
}

vi.mock('../../../provider/TileParticipantProvider', () => ({
  default: ({
    connectionIdentifier,
    displayName,
    remoteParticipant,
    children,
  }: PropsWithChildren<MockTileParticipantProviderProps>) => (
    <div
      data-testid="tile"
      data-connection-identifier={connectionIdentifier}
      data-display-name={displayName}
      data-remote-identity={remoteParticipant?.identity ?? ''}
    >
      {children}
    </div>
  ),
}));

vi.mock('./Thumbnail', () => ({
  Thumbnail: ({ width, source }: { width: number; source?: MediaSessionType }) => (
    <div data-testid="thumbnail" data-width={width} data-source={source ?? ''} />
  ),
}));

type MockTile = CinemaViewTile<CinemaViewParticipant>;

const connectionIdentifierOf = (index: number) => `participant-${index}:connection-${index}` as ConnectionIdentifier;

const createTile = (index: number, source: MediaSessionType = Track.Source.Camera): MockTile => {
  const connectionIdentifier = connectionIdentifierOf(index);
  return {
    participant: {
      id: `participant-${index}` as ParticipantId,
      connections: [`connection-${index}` as ConnectionId],
      displayName: `Participant ${index}`,
    } as CinemaViewParticipant,
    connectionIdentifier,
    source,
    tileKey: source === Track.Source.ScreenShare ? `${connectionIdentifier}:screen` : connectionIdentifier,
  };
};

const createCameraTiles = (count: number) => Array.from({ length: count }, (_, index) => createTile(index));

const featured = (index: number, source: MediaSessionType = Track.Source.Camera): TileIdentifier => ({
  connectionIdentifier: connectionIdentifierOf(index),
  source,
});

// Mocks the ordered tiles and returns the participant data props for the filmstrip
const setup = ({
  tiles,
  featuredTile,
  remoteParticipants = [],
  visibleThumbnails = 5,
}: {
  tiles: MockTile[];
  featuredTile: TileIdentifier | undefined;
  remoteParticipants?: RemoteParticipant[];
  visibleThumbnails?: number;
}): FilmstripProps => {
  mockUseOrderedTiles.mockReturnValue({ orderedTiles: tiles });
  return {
    cinemaViewParticipants: tiles.map((tile) => tile.participant),
    remoteParticipantsMap: new Map(remoteParticipants.map((participant) => [participant.identity, participant])),
    featuredTile,
    thumbnailWidth: 340,
    visibleThumbnails,
  };
};

const renderFilmstrip = (props: FilmstripProps) =>
  renderWithProviders(<Filmstrip {...props} />, { provider: { mui: true } });

// Rendered tiles as `connectionIdentifier/source` to make assertions on order and source readable
const renderedTiles = () =>
  screen.queryAllByTestId('tile').map((tile) => {
    const thumbnail = within(tile).getByTestId('thumbnail');
    return `${tile.dataset.connectionIdentifier}/${thumbnail.dataset.source}`;
  });

const expectArrows = ({ left, right }: { left: boolean; right: boolean }) => {
  const leftArrow = screen.queryByLabelText('navigate-to-left');
  const rightArrow = screen.queryByLabelText('navigate-to-right');
  if (left) {
    expect(leftArrow).toBeInTheDocument();
  } else {
    expect(leftArrow).not.toBeInTheDocument();
  }
  if (right) {
    expect(rightArrow).toBeInTheDocument();
  } else {
    expect(rightArrow).not.toBeInTheDocument();
  }
};

describe('Filmstrip', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseConferenceUiVersion.mockReturnValue({ isV2: true });
  });

  it('orders the given participants as an unbounded strip', () => {
    const props = setup({ tiles: createCameraTiles(2), featuredTile: featured(0) });
    renderFilmstrip(props);
    expect(mockUseOrderedTiles).toHaveBeenCalledWith(props.cinemaViewParticipants, { unbounded: true });
  });

  describe('featured tile', () => {
    it('renders no thumbnails while there is no featured tile', () => {
      const props = setup({ tiles: createCameraTiles(3), featuredTile: undefined });
      renderFilmstrip(props);
      expect(screen.getByTestId('filmstrip')).toBeInTheDocument();
      expect(renderedTiles()).toEqual([]);
    });

    it('renders no thumbnails when the featured tile is the only tile', () => {
      const props = setup({ tiles: createCameraTiles(1), featuredTile: featured(0) });
      renderFilmstrip(props);
      expect(renderedTiles()).toEqual([]);
    });

    it('renders all tiles except of the featured tile and keeps the order of the other tiles', () => {
      const props = setup({ tiles: createCameraTiles(3), featuredTile: featured(1) });
      renderFilmstrip(props);
      expect(renderedTiles()).toEqual([`${connectionIdentifierOf(0)}/camera`, `${connectionIdentifierOf(2)}/camera`]);
    });

    it('renders the camera tile of a participant whose screen share is featured', () => {
      const props = setup({
        tiles: [createTile(0), createTile(1), createTile(1, Track.Source.ScreenShare)],
        featuredTile: featured(1, Track.Source.ScreenShare),
      });
      renderFilmstrip(props);
      expect(renderedTiles()).toEqual([`${connectionIdentifierOf(0)}/camera`, `${connectionIdentifierOf(1)}/camera`]);
    });

    it('renders the screen share tile of a participant whose camera is featured', () => {
      const props = setup({
        tiles: [createTile(0), createTile(1), createTile(1, Track.Source.ScreenShare)],
        featuredTile: featured(1, Track.Source.Camera),
      });
      renderFilmstrip(props);
      expect(renderedTiles()).toEqual([
        `${connectionIdentifierOf(0)}/camera`,
        `${connectionIdentifierOf(1)}/screen_share`,
      ]);
    });

    // V2-CLEANUP: remove after transition to V2
    it('renders no tile of a participant whose screen share is featured in V1', () => {
      // V1 has only a camera tile per participant, the pinned screen share is shown by it
      mockUseConferenceUiVersion.mockReturnValue({ isV2: false });
      const props = setup({
        tiles: [createTile(0), createTile(1)],
        featuredTile: featured(1, Track.Source.ScreenShare),
      });
      renderFilmstrip(props);
      expect(renderedTiles()).toEqual([`${connectionIdentifierOf(0)}/camera`]);
    });
  });

  describe('thumbnail rendering', () => {
    it('passes width and source to the thumbnail', () => {
      const props = setup({
        tiles: [createTile(0), createTile(1, Track.Source.ScreenShare)],
        featuredTile: featured(2),
      });
      renderFilmstrip(props);
      const thumbnails = screen.getAllByTestId('thumbnail');
      expect(thumbnails.map((thumbnail) => thumbnail.dataset.width)).toEqual(['340', '340']);
      expect(thumbnails.map((thumbnail) => thumbnail.dataset.source)).toEqual(['camera', 'screen_share']);
    });

    it('passes the LiveKit participant if known and the controller display name to the provider', () => {
      const remoteParticipant = { identity: connectionIdentifierOf(1) } as unknown as RemoteParticipant;
      const props = setup({
        tiles: createCameraTiles(3),
        featuredTile: featured(2),
        remoteParticipants: [remoteParticipant],
      });
      renderFilmstrip(props);
      const tiles = screen.getAllByTestId('tile');
      expect(tiles.map((tile) => tile.dataset.displayName)).toEqual(['Participant 0', 'Participant 1']);
      expect(tiles.map((tile) => tile.dataset.remoteIdentity)).toEqual(['', connectionIdentifierOf(1)]);
    });
  });

  describe('navigation', () => {
    it('shows no arrows when all tiles fit', () => {
      // 5 tiles without the featured one
      const props = setup({ tiles: createCameraTiles(6), featuredTile: featured(0) });
      renderFilmstrip(props);
      expect(renderedTiles()).toHaveLength(5);
      expectArrows({ left: false, right: false });
    });

    it('slides by a page and stops at the last full page', () => {
      // 12 tiles without the featured one: participants 1..12
      const props = setup({ tiles: createCameraTiles(13), featuredTile: featured(0) });
      renderFilmstrip(props);
      expect(renderedTiles()).toEqual([1, 2, 3, 4, 5].map((index) => `${connectionIdentifierOf(index)}/camera`));
      expectArrows({ left: false, right: true });

      fireEvent.click(screen.getByLabelText('navigate-to-right'));
      expect(renderedTiles()).toEqual([6, 7, 8, 9, 10].map((index) => `${connectionIdentifierOf(index)}/camera`));
      expectArrows({ left: true, right: true });

      // The last page is filled up instead of showing only the remaining two tiles
      fireEvent.click(screen.getByLabelText('navigate-to-right'));
      expect(renderedTiles()).toEqual([8, 9, 10, 11, 12].map((index) => `${connectionIdentifierOf(index)}/camera`));
      expectArrows({ left: true, right: false });

      fireEvent.click(screen.getByLabelText('navigate-to-left'));
      expect(renderedTiles()).toEqual([3, 4, 5, 6, 7].map((index) => `${connectionIdentifierOf(index)}/camera`));
      expectArrows({ left: true, right: true });

      fireEvent.click(screen.getByLabelText('navigate-to-left'));
      expect(renderedTiles()).toEqual([1, 2, 3, 4, 5].map((index) => `${connectionIdentifierOf(index)}/camera`));
      expectArrows({ left: false, right: true });
    });

    it('fills the gap when tiles disappear while scrolled to the end', () => {
      // 7 tiles without the featured one: participants 1..7
      const props = setup({ tiles: createCameraTiles(8), featuredTile: featured(0) });

      const { rerender } = renderFilmstrip(props);
      fireEvent.click(screen.getByLabelText('navigate-to-right'));
      expect(renderedTiles()).toEqual([3, 4, 5, 6, 7].map((index) => `${connectionIdentifierOf(index)}/camera`));

      // Participants 6 and 7 leave
      rerender(<Filmstrip {...setup({ tiles: createCameraTiles(6), featuredTile: featured(0) })} />);

      expect(renderedTiles()).toEqual([1, 2, 3, 4, 5].map((index) => `${connectionIdentifierOf(index)}/camera`));
      expectArrows({ left: false, right: false });
    });

    it('shows more tiles when the number of visible thumbnails grows', () => {
      const props = setup({ tiles: createCameraTiles(8), featuredTile: featured(0), visibleThumbnails: 3 });

      const { rerender } = renderFilmstrip(props);
      expect(renderedTiles()).toHaveLength(3);
      expectArrows({ left: false, right: true });

      rerender(<Filmstrip {...props} visibleThumbnails={7} />);

      expect(renderedTiles()).toHaveLength(7);
      expectArrows({ left: false, right: false });
    });
  });
});
