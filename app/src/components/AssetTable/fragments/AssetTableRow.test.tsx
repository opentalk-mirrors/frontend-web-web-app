// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { within } from '@testing-library/dom';
import { render, screen } from '@testing-library/react';
import format from 'date-fns/format';

import { formatBytes } from '../../../utils/numberUtils';
import { mockedRoomAssets } from '../../../utils/testUtils';
import { AssetTableRow } from './AssetTableRow';

const mockHandleDownload = jest.fn();

const mockHandleDelete = jest.fn();

// checks all the text content inside a row
export const checkRowTextContent = (
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

// checks specifically action buttons within an asset row
const checkAssetActionButtons = (row: HTMLElement, deletable: boolean) => {
  const cells = within(row).getAllByRole('cell');
  const actionCell = cells[3];
  const actionButtons = within(actionCell).getAllByRole('button');
  const expectedButtonsNumber = deletable ? 2 : 1;
  expect(actionButtons.length).toEqual(expectedButtonsNumber);
};

describe('AssetTableRow', () => {
  const asset = mockedRoomAssets[0];
  test('renders asset with both action buttons', () => {
    const deletable = true;
    render(<AssetTableRow asset={asset} handleDownload={mockHandleDownload} handleDelete={mockHandleDelete} />);
    const tableRow = screen.getByRole('row');

    const isHeader = false;
    checkRowTextContent(
      tableRow,
      isHeader,
      asset.filename,
      format(new Date(asset.createdAt), 'HH:mm dd.MM.yyyy'),
      formatBytes(asset.size)
    );
    checkAssetActionButtons(tableRow, deletable);

    // check download button
    const downloadButton = within(tableRow).getByRole('button', { name: /action-download/i });
    downloadButton.click();
    expect(mockHandleDownload).toHaveBeenCalledWith({
      assetId: asset.id,
      filename: asset.filename,
      fileSize: asset.size,
    });

    // check delete button
    const deleteButton = within(tableRow).getByRole('button', { name: /action-delete/i });
    deleteButton.click();
    expect(mockHandleDelete).toHaveBeenCalledWith(asset.id);
  });

  test('disables buttons if asset progress is passed', () => {
    render(
      <AssetTableRow asset={asset} handleDownload={mockHandleDownload} handleDelete={mockHandleDelete} progress={0} />
    );
    const tableRow = screen.getByRole('row');

    const downloadingButton = within(tableRow).getByRole('button', { name: /download-in-progress/i });
    expect(downloadingButton).toBeDisabled();

    const deleteButton = within(tableRow).getByRole('button', { name: /action-delete/i });
    expect(deleteButton).toBeDisabled();
  });
});
