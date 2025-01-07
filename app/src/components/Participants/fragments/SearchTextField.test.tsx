// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen, fireEvent, waitFor, createStore, cleanup } from '../../../utils/testUtils';
import SearchTextField from './SearchTextField';
import { items } from './constants';

describe('SearchTextField', () => {
  const { store, dispatch } = createStore();
  const mockOnSearch = jest.fn();
  afterEach(() => cleanup());

  test('render SearchTextField component without crashing', async () => {
    await render(<SearchTextField onSearch={mockOnSearch} />, store);

    const searchInput = screen.getByRole('textbox', { name: 'participant-search-label' });
    expect(searchInput).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /sort-by/i })).not.toBeInTheDocument();
  });

  test('render SearchTextField component with showSort flag', async () => {
    await render(<SearchTextField onSearch={mockOnSearch} showSort />, store);
    const sortButton = screen.getByRole('button', { name: /sort-by/i });
    expect(sortButton).toBeInTheDocument();
  });

  test('add value into input should trigger onSearch()', async () => {
    await render(<SearchTextField onSearch={mockOnSearch} showSort />, store);
    const searchInput = screen.getByRole('textbox', { name: 'participant-search-label' });
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveValue('');

    fireEvent.change(searchInput, { target: { value: 'testing...' } });

    await waitFor(() => {
      expect(mockOnSearch).toBeCalledWith('testing...');
      expect(mockOnSearch).toBeCalledTimes(1);
    });
  });

  test('click on sortButton should open menu with list of sortOptionItems', async () => {
    await render(<SearchTextField onSearch={mockOnSearch} showSort />, store);
    const sortButton = screen.getByRole('button', { name: /sort-by/i });
    expect(sortButton).toBeInTheDocument();

    fireEvent.click(sortButton);
    await waitFor(() => {
      items.map((item) => expect(screen.getByRole('menuitem', { name: item.i18nKey })).toBeInTheDocument());
    });
  });

  test('click on sort-raised-hand item should dispatch setParticipantsSortOption with raisedHandFirst', async () => {
    await render(<SearchTextField onSearch={mockOnSearch} showSort />, store);
    const sortButton = screen.getByRole('button', { name: /sort-by/i });
    expect(sortButton).toBeInTheDocument();

    fireEvent.click(sortButton);
    let raisedHandButton = null;
    await waitFor(() => {
      raisedHandButton = screen.getByRole('menuitem', { name: 'sort-raised-hand' });
      expect(raisedHandButton).toBeInTheDocument();
    });

    raisedHandButton && fireEvent.click(raisedHandButton);
    await waitFor(() => {
      expect(dispatch.mock.calls).toContainEqual([
        { payload: 'raisedHandFirst', type: 'ui/setParticipantsSortOption' },
      ]);
    });
  });
});
