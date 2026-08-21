// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, screen } from '@testing-library/react';

import { GRID_SIZES, MAX_GRID_TILES_MOBILE } from '../../../../constants';
import LayoutOptions from '../../../../enums/LayoutOptions';
import { configureStore, renderWithProviders } from '../../../../utils/testUtils';
import MobilePagination from './MobilePagination';

// This fragment only renders inside the mobile header, so the grid page size must use the mobile cap.
vi.mock('../../../../hooks/useMediaQuery', async (importOriginal) => ({
  ...((await importOriginal()) as typeof import('../../../../hooks/useMediaQuery')),
  useIsMobile: () => true,
}));

describe('MobilePagination rendering logic', () => {
  it('should render null when selectedLayout is not Grid', () => {
    const { store } = configureStore({
      initialState: {
        participants: {
          ids: [],
          entities: {},
        },
        ui: {
          cinemaLayout: LayoutOptions.Speaker,
        },
      },
    });
    renderWithProviders(<MobilePagination />, { store, provider: { mui: true } });
    const element = screen.getByTestId('mobile-pagination-container');
    expect(element).toBeEmptyDOMElement();
  });

  it('should render page index with current page in Grid layout.', () => {
    const { store } = configureStore({
      initialState: {
        participants: {
          ids: Array.from({ length: MAX_GRID_TILES_MOBILE * 5 }, (_, i) => i.toString()),
          entities: Array.from({ length: MAX_GRID_TILES_MOBILE * 5 }, (v, i) => i).reduce(
            (acc: Record<string, unknown>, _, i) =>
              ({
                ...acc,
                [i]: { id: i.toString(), leftAt: null, waitingState: 'joined', breakoutRoomId: '1' },
              }) as Record<string, unknown>,
            {}
          ),
        },
        breakout: {
          currentBreakoutRoomId: '1',
        },
        ui: {
          cinemaLayout: LayoutOptions.Grid,
          paginationPage: 4,
          cinemaGridSize: 9,
        },
      },
    });
    renderWithProviders(<MobilePagination />, { store, provider: { mui: true } });
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('should render all pages in the popover when page index is clicked', () => {
    const { store } = configureStore({
      initialState: {
        participants: {
          ids: Array.from({ length: MAX_GRID_TILES_MOBILE * 3 }, (_, i) => i.toString()),
          entities: Array.from({ length: MAX_GRID_TILES_MOBILE * 3 }, (v, i) => i).reduce(
            (acc: Record<string, unknown>, _, i) =>
              ({
                ...acc,
                [i]: { id: i.toString(), leftAt: null, waitingState: 'joined', breakoutRoomId: '1' },
              }) as unknown as Record<string, unknown>,
            {}
          ),
        },
        breakout: {
          currentBreakoutRoomId: '1',
        },
        ui: {
          cinemaLayout: LayoutOptions.Grid,
          paginationPage: 1,
          cinemaGridSize: 9,
        },
      },
    });
    renderWithProviders(<MobilePagination />, { store, provider: { mui: true } });
    const pageIndex = screen.getByText('1');
    fireEvent.click(pageIndex);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.queryByText('4')).not.toBeInTheDocument();
  });
  it.each(GRID_SIZES)('caps selected size %i when counting pages for 25 participants', (cinemaGridSize) => {
    const ids = Array.from({ length: 25 }, (_, index) => String(index));
    const { store } = configureStore({
      initialState: {
        participants: {
          ids,
          entities: Object.fromEntries(
            ids.map((id) => [id, { id, leftAt: null, waitingState: 'joined', breakoutRoomId: '1' }])
          ),
        },
        breakout: { currentBreakoutRoomId: '1' },
        ui: { cinemaLayout: LayoutOptions.Grid, cinemaGridSize, paginationPage: 1 },
      },
    });
    renderWithProviders(<MobilePagination />, { store, provider: { mui: true } });
    fireEvent.click(screen.getByText('1'));
    const pageCount = Math.ceil(25 / Math.min(cinemaGridSize, MAX_GRID_TILES_MOBILE));
    expect(screen.getByText(String(pageCount))).toBeInTheDocument();
    expect(screen.queryByText(String(pageCount + 1))).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('2'));
    expect(store.getState().ui.paginationPage).toBe(2);
  });
});
