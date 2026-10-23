// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { fireEvent, screen } from '@testing-library/react';

import LayoutOptions from '../../../../enums/LayoutOptions';
import { configureStore, renderWithProviders } from '../../../../utils/testUtils';
import MobilePagination from './MobilePagination';

const useGridPageCountMock = vi.fn();
vi.mock('../../../../hooks/useGridPageCount', () => ({
  useGridPageCount: () => useGridPageCountMock(),
}));

describe('MobilePagination', () => {
  it('should render empty pagination container in speaker view', () => {
    const { store } = configureStore({
      initialState: {
        ui: {
          cinemaLayout: LayoutOptions.Speaker,
        },
      },
    });
    useGridPageCountMock.mockReturnValue(3);
    renderWithProviders(<MobilePagination />, { store, provider: { mui: true } });
    const element = screen.getByTestId('mobile-pagination-container');
    expect(element).toBeEmptyDOMElement();
  });

  it('should render page index with current page in grid view', () => {
    const { store } = configureStore({
      initialState: {
        ui: {
          cinemaLayout: LayoutOptions.Grid,
          paginationPage: 4,
        },
      },
    });
    useGridPageCountMock.mockReturnValue(4);
    renderWithProviders(<MobilePagination />, { store, provider: { mui: true } });
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('should render all pages in the popover when page index is clicked', () => {
    const { store } = configureStore({
      initialState: {
        ui: {
          cinemaLayout: LayoutOptions.Grid,
          paginationPage: 1,
        },
      },
    });
    useGridPageCountMock.mockReturnValue(3);
    renderWithProviders(<MobilePagination />, { store, provider: { mui: true } });
    const pageIndex = screen.getByText('1');
    fireEvent.click(pageIndex);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.queryByText('4')).not.toBeInTheDocument();
  });
});
