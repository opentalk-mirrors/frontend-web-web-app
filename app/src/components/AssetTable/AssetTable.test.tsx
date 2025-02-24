// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { render, screen } from '@testing-library/react';

import { mockedRoomAssets } from '../../utils/testUtils';
import { sleep } from '../../utils/timeUtils';
import AssetTable from './AssetTable';
import { checkRowTextContent } from './fragments/AssetTableRow.test';

const handleDownload = jest.fn(() => {
  return sleep(100);
});

const handleDelete = jest.fn(() => {
  return sleep(100);
});

describe('Asset Table', () => {
  test('renders table correctly for one asset with both action buttons', () => {
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

  test('renders table correctly for multiple assets and shows no delete button', () => {
    render(<AssetTable assets={mockedRoomAssets} onDownload={handleDownload} />);
    expect(screen.queryByRole('button', { name: /action-delete/i })).not.toBeInTheDocument();
  });
});
