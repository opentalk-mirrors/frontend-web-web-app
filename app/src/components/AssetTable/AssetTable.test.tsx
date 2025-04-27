// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen, within } from '@testing-library/react';

import { mockedRoomAssets } from '../../utils/testUtils';
import { sleep } from '../../utils/timeUtils';
import AssetTable from './AssetTable';

// checks all the text content inside a row
const checkRowTextContent = (
  row: HTMLElement,
  isHeader: boolean,
  name: string,
  created: string,
  size: string,
  action?: string
) => {
  const columns = within(row).getAllByRole(isHeader ? 'columnheader' : 'cell');
  expect(columns).toHaveLength(4);
  expect(columns[0]).toHaveTextContent(name);
  expect(columns[1]).toHaveTextContent(created);
  expect(columns[2]).toHaveTextContent(size);
  // asset rows have buttons inside, we will check them separately
  if (action) {
    expect(columns[3]).toHaveTextContent(action);
  }
};

const handleDownload = jest.fn(() => {
  return sleep(100);
});

const handleDelete = jest.fn(() => {
  return sleep(100);
});

describe('Asset Table', () => {
  it('renders table correctly for one asset with both action buttons', () => {
    const asset = mockedRoomAssets[0];
    render(<AssetTable assets={[asset]} onDownload={handleDownload} onDelete={handleDelete} />);
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();

    // Should be 2 rows: header row + asset row
    const rows = screen.getAllByRole('row');
    expect(rows.length).toEqual(2);

    // check header row
    const headerRow = rows[0];
    const isHeader = true;
    checkRowTextContent(
      headerRow,
      isHeader,
      'asset-table-filename',
      'asset-table-created',
      'asset-table-size',
      'asset-table-actions'
    );
  });

  it('renders table correctly for multiple assets and shows no delete button', () => {
    render(<AssetTable assets={mockedRoomAssets} onDownload={handleDownload} />);
    expect(screen.queryByRole('button', { name: /action-delete/i })).not.toBeInTheDocument();
  });
});
