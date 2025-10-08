// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { screen, fireEvent } from '@testing-library/react';

import { renderWithProviders, configureStore } from '../../../utils/testUtils';
import SearchTextField from './SearchTextField';
import { items } from './constants';

describe('SearchTextField', () => {
  const { store, dispatchSpy } = configureStore();
  const mockOnSearch = vi.fn();

  it('render SearchTextField component without crashing', () => {
    renderWithProviders(<SearchTextField onSearch={mockOnSearch} />, { store, provider: { mui: true } });
    const searchInput = screen.getByRole('textbox', { name: 'participant-search-label' });

    expect(searchInput).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /sort-by/i })).not.toBeInTheDocument();
  });

  it('render SearchTextField component with showSort flag', () => {
    renderWithProviders(<SearchTextField onSearch={mockOnSearch} showSort />, { store, provider: { mui: true } });
    const sortButton = screen.getByRole('button', { name: /sort-by/i });

    expect(sortButton).toBeInTheDocument();
  });

  it('add value into input should trigger onSearch()', () => {
    renderWithProviders(<SearchTextField onSearch={mockOnSearch} showSort />, { store, provider: { mui: true } });
    const searchInput = screen.getByRole('textbox', { name: 'participant-search-label' });

    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveValue('');

    fireEvent.change(searchInput, { target: { value: 'testing...' } });

    expect(mockOnSearch).toHaveBeenCalledExactlyOnceWith('testing...');
  });

  it('click on sortButton should open menu with list of sortOptionItems', () => {
    renderWithProviders(<SearchTextField onSearch={mockOnSearch} showSort />, { store, provider: { mui: true } });
    const sortButton = screen.getByRole('button', { name: /sort-by/i });
    expect(sortButton).toBeInTheDocument();

    fireEvent.click(sortButton);

    items.map((item) => expect(screen.getByRole('menuitem', { name: item.i18nKey })).toBeInTheDocument());
  });

  it('click on sort-raised-hand item should dispatch setParticipantsSortOption with raisedHandFirst', () => {
    renderWithProviders(<SearchTextField onSearch={mockOnSearch} showSort />, { store, provider: { mui: true } });
    const sortButton = screen.getByRole('button', { name: /sort-by/i });
    expect(sortButton).toBeInTheDocument();

    fireEvent.click(sortButton);
    let raisedHandButton = null;

    raisedHandButton = screen.getByRole('menuitem', { name: 'sort-raised-hand' });
    expect(raisedHandButton).toBeInTheDocument();

    raisedHandButton && fireEvent.click(raisedHandButton);

    expect(dispatchSpy.mock.calls).toContainEqual([
      { payload: 'raisedHandFirst', type: 'ui/setParticipantsSortOption' },
    ]);
  });
});
