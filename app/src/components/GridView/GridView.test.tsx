// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { act, screen } from '@testing-library/react';
import { PropsWithChildren } from 'react';

import { GRID_SIZES, MAX_GRID_TILES_MOBILE } from '../../constants';
import { useCinemaViewParticipants, useOrderedTiles } from '../../hooks';
import { setPaginationPage } from '../../store/slices/uiSlice';
import { renderWithProviders, mockStore, mockedParticipant } from '../../utils/testUtils';
import GridView from './GridView';
import { GRID_CELL_WIDTH, GRID_COLUMNS_VAR, GRID_GAP_VAR, GRID_TILE_WIDTH_VAR } from './gridLayout';

const useIsMobileMock = vi.fn().mockReturnValue(false);
vi.mock('../../hooks/useMediaQuery', async (importOriginal) => ({
  ...((await importOriginal()) as typeof import('../../hooks/useMediaQuery')),
  useIsMobile: () => useIsMobileMock(),
}));

vi.mock('./fragments/GridCell', () => ({
  __esModule: true,
  default: ({ highlight }: { highlight: boolean }) => <div data-testid="gridCell" data-highlight={highlight}></div>,
}));

vi.mock('@livekit/components-react', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('@mui/material');

  return {
    ...actual,
    ParticipantContext: {
      Provider: ({ children }: PropsWithChildren) => {
        return <div>{children}</div>;
      },
    },
    useRoomContext: () => vi.fn(),
    useSortedParticipants: vi.fn(() => []),
    useRemoteParticipants: vi.fn(() => [mockedParticipant(0)]),
  };
});

const PARTICIPANTS_COUNT = 25;

const GridWithParticipants = () => {
  const { cinemaViewParticipants, remoteParticipantsMap, featuredTile } = useCinemaViewParticipants();
  const { pageTiles } = useOrderedTiles(cinemaViewParticipants, {
    featuredConnectionIdentifier: featuredTile?.connectionIdentifier,
  });
  return <GridView pageTiles={pageTiles} remoteParticipantsMap={remoteParticipantsMap} />;
};

describe('GridView', () => {
  const renderPages = (cinemaGridSize: number, participantCount: number, pageSize: number) => {
    const { store } = mockStore(participantCount, {
      store: { initialState: { ui: { cinemaGridSize, paginationPage: 1 } } },
    });
    renderWithProviders(<GridWithParticipants />, { store });

    const tilesPerPage: number[] = [];
    for (let page = 1; page <= Math.ceil(participantCount / pageSize); page++) {
      act(() => store.dispatch(setPaginationPage(page)));
      tilesPerPage.push(screen.queryAllByTestId('gridCell').length);
    }
    return tilesPerPage;
  };

  beforeEach(() => {
    useIsMobileMock.mockReturnValue(false);
  });

  it.each(GRID_SIZES)('renders the full selected size %i on desktop', (cinemaGridSize) => {
    expect(renderPages(cinemaGridSize, PARTICIPANTS_COUNT, cinemaGridSize)).toEqual(
      Array.from({ length: Math.ceil(PARTICIPANTS_COUNT / cinemaGridSize) }, (_, page) =>
        Math.min(cinemaGridSize, PARTICIPANTS_COUNT - page * cinemaGridSize)
      )
    );
  });

  it.each(GRID_SIZES)('caps selected size %i on mobile and renders every page', (cinemaGridSize) => {
    useIsMobileMock.mockReturnValue(true);
    const pageSize = Math.min(cinemaGridSize, MAX_GRID_TILES_MOBILE);
    expect(renderPages(cinemaGridSize, PARTICIPANTS_COUNT, pageSize)).toEqual(
      Array.from({ length: Math.ceil(PARTICIPANTS_COUNT / pageSize) }, (_, page) =>
        Math.min(pageSize, PARTICIPANTS_COUNT - page * pageSize)
      )
    );
  });

  it('render GridView', () => {
    const { store } = mockStore(1);
    renderWithProviders(<GridWithParticipants />, { store });

    expect(screen.getByTestId('gridCell')).toBeVisible();
  });

  describe('speaker highlight', () => {
    const getGridCells = (participantCount: number, paginationPage = 1) => {
      const { store } = mockStore(participantCount, {
        store: { initialState: { ui: { cinemaGridSize: 6, paginationPage } } },
      });
      renderWithProviders(<GridWithParticipants />, { store });
      return screen.getAllByTestId('gridCell');
    };

    it('disables highlight in a one-to-one meeting', () => {
      const gridCells = getGridCells(1);

      expect(gridCells).toHaveLength(1);
      expect(gridCells[0]).toHaveAttribute('data-highlight', 'false');
    });

    it('enables highlight on every cell when more than two participants are in the meeting', () => {
      const gridCells = getGridCells(2);

      expect(gridCells).toHaveLength(2);
      for (const cell of gridCells) {
        expect(cell).toHaveAttribute('data-highlight', 'true');
      }
    });

    it('enables highlight for a single tile on a page, if there are more than two participants in the meeting', () => {
      const gridCells = getGridCells(7, 2);

      expect(gridCells).toHaveLength(1);
      expect(gridCells[0]).toHaveAttribute('data-highlight', 'true');
    });
  });

  describe('tile size variables', () => {
    const setupGrid = () => {
      const { store } = mockStore(4, {
        store: { initialState: { ui: { cinemaGridSize: 6, paginationPage: 1 } } },
      });
      renderWithProviders(<GridWithParticipants />, { store });
      return screen.getByTestId('gridContainer');
    };

    it('leaves the variables unset while the container is unmeasured', () => {
      const gridContainer = setupGrid();

      expect(gridContainer.style.getPropertyValue(GRID_TILE_WIDTH_VAR)).toBe('');
      expect(gridContainer.style.getPropertyValue(GRID_COLUMNS_VAR)).toBe('');
    });

    it('publishes floored pixel values once measured', () => {
      vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(1000);
      vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(600);

      const gridContainer = setupGrid();
      const width = gridContainer.style.getPropertyValue(GRID_TILE_WIDTH_VAR);
      const columns = gridContainer.style.getPropertyValue(GRID_COLUMNS_VAR);

      expect(width).toMatch(/^\d+px$/);
      expect(columns).toMatch(/^\d+$/);
      expect(Number.parseInt(width, 10)).toBeGreaterThan(0);
      expect(Number.parseInt(columns, 10)).toBeGreaterThan(0);

      vi.restoreAllMocks();
    });

    // GridCell is mocked here, so assert the contract instead: every measured variable its width
    // reads has to be one the container publishes, otherwise tiles silently fall back and wrap.
    it('publishes every measured variable the cell width depends on', () => {
      vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(1000);
      vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(600);

      const gridContainer = setupGrid();
      const consumed = new Set([...GRID_CELL_WIDTH.matchAll(/var\((--[\w-]+)/g)].map(([, name]) => name));
      // The gap is static and declared in the container's own style rule, not published per render.
      consumed.delete(GRID_GAP_VAR);

      expect(consumed).toEqual(new Set([GRID_TILE_WIDTH_VAR, GRID_COLUMNS_VAR]));
      for (const name of consumed) {
        expect(gridContainer.style.getPropertyValue(name)).not.toBe('');
      }

      vi.restoreAllMocks();
    });
  });
});
