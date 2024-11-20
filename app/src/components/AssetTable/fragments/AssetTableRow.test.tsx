// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import format from 'date-fns/format';

import { formatBytes } from '../../../utils/numberUtils';
import { render, screen, mockedRoomAssets, waitFor } from '../../../utils/testUtils';
import { sleep } from '../../../utils/timeUtils';
import { AssetTableRow } from './AssetTableRow';

const handleDownload = jest.fn(() => {
  return sleep(100);
});

const handleDelete = jest.fn(() => {
  return sleep(100);
});

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
  action ? expect(columns[3]).toHaveTextContent(action) : null;
};

// checks specifically action buttons within an asset row
const checkAssetActionButtons = (row: HTMLElement, deletable: boolean) => {
  const cells = within(row).getAllByRole('cell');
  const actionCell = cells[3];
  const actionButtons = within(actionCell).getAllByRole('button');
  const expectedButtonsNumber = deletable ? 2 : 1;
  expect(actionButtons.length).toEqual(expectedButtonsNumber);
};

describe('Asset Table', () => {
  const asset = mockedRoomAssets[0];
  it('renders asset with both action buttons', async () => {
    const deletable = true;
    await render(<AssetTableRow asset={asset} handleDownload={handleDownload} handleDelete={handleDelete} />);
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
    userEvent.click(downloadButton);
    await waitFor(() => {
      expect(handleDownload).toHaveBeenCalledWith({
        assetId: asset.id,
        filename: asset.filename,
        fileSize: asset.size,
      });
    });

    // check delete button
    const deleteButton = within(tableRow).getByRole('button', { name: /action-delete/i });
    userEvent.click(deleteButton);
    await waitFor(() => {
      expect(handleDelete).toHaveBeenCalledWith(asset.id);
    });
  });

  it('disables buttons if asset progress is passed', async () => {
    await render(
      <AssetTableRow asset={asset} handleDownload={handleDownload} handleDelete={handleDelete} progress={0} />
    );
    const tableRow = screen.getByRole('row');

    const downloadingButton = within(tableRow).getByRole('button', { name: /download-in-progress/i });
    expect(downloadingButton).toBeDisabled();

    const deleteButton = within(tableRow).getByRole('button', { name: /action-delete/i });
    expect(deleteButton).toBeDisabled();
  });
});
