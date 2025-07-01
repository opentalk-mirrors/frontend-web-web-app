// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, screen } from '@testing-library/react';

import { MAX_GRID_TILES_MOBILE } from '../../../../constants';
import LayoutOptions from '../../../../enums/LayoutOptions';
import { configureStore, renderWithProviders } from '../../../../utils/testUtils';
import MobilePagination from './MobilePagination';

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
    renderWithProviders(<MobilePagination />, { store });
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
        },
      },
    });
    renderWithProviders(<MobilePagination />, { store });
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
        },
      },
    });
    renderWithProviders(<MobilePagination />, { store });
    const pageIndex = screen.getByText('1');
    fireEvent.click(pageIndex);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.queryByText('4')).not.toBeInTheDocument();
  });
});
