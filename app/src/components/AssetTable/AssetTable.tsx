// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Table, TableContainer, TableHead, TableBody, TableRow, TableCell, Paper, styled } from '@mui/material';
import { AssetId, BaseAsset } from '@opentalk/rest-api-rtk-query';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AssetDownloadBaseInfo } from '../../hooks/useDownloadRoomAsset';
import { AssetTableRow } from './fragments/AssetTableRow';

// `component` prop lost when wrapping with `styled`
// https://github.com/mui/material-ui/issues/29875
const AssetTableContainer = styled(TableContainer, {
  shouldForwardProp: (prop) => prop !== 'maxHeight',
})<{ maxHeight?: string | number; component?: React.ElementType }>(({ theme, maxHeight }) => ({
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
  maxHeight,
}));

interface AssetTableProps {
  assets: Array<BaseAsset>;
  onDownload: ({ assetId, filename, fileSize, updateDownloadProgress }: AssetDownloadBaseInfo) => Promise<void>;
  onDelete?: (assetId: AssetId) => Promise<void | { data: void } | { error: FetchBaseQueryError | SerializedError }>;
  maxHeight?: string;
}

/*
  If onDelete function is set => the assets are deletable and `Delete` button will be exposed in the UI
  Otherwise we show only the `Download` button
*/
export const AssetTable = ({ assets, onDownload, onDelete, maxHeight = 'none' }: AssetTableProps) => {
  const { t } = useTranslation();
  const [disabledRows, setDisabledRows] = useState<Record<AssetId, number>>({});

  const setRow = (assetId: AssetId, progressPercentage?: number) =>
    setDisabledRows((state) => {
      const newList = { ...state };
      if (progressPercentage === undefined) {
        delete newList[assetId];
      } else {
        newList[assetId] = progressPercentage;
      }
      return newList;
    });

  // While downloading we disable buttons in the relevant row
  const handleDownload = async ({ assetId, filename, fileSize }: Omit<AssetDownloadBaseInfo, 'onDownloadProgress'>) => {
    setRow(assetId, 0);
    await onDownload({
      assetId,
      filename,
      fileSize,
      updateDownloadProgress: (percentage) => setRow(assetId, percentage),
    });
    setRow(assetId);
  };

  // While deleting we disable buttons in the relevant row
  const handleDelete = onDelete
    ? async (assetId: AssetId) => {
        if (onDelete) {
          setRow(assetId, 0);
          await onDelete(assetId);
          setRow(assetId);
        }
      }
    : undefined;

  const renderTableRows = () => {
    return assets?.map((asset) => {
      const rowPercentage = disabledRows[asset.id];

      return (
        <AssetTableRow
          key={asset.id}
          asset={asset}
          handleDownload={handleDownload}
          handleDelete={handleDelete}
          progress={rowPercentage}
        />
      );
    });
  };

  return (
    <AssetTableContainer maxHeight={maxHeight} component={Paper}>
      <Table padding="normal" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>{t('asset-table-filename')}</TableCell>
            <TableCell>{t('asset-table-created')}</TableCell>
            <TableCell>{t('asset-table-size')}</TableCell>
            <TableCell>{t('asset-table-actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{renderTableRows()}</TableBody>
      </Table>
    </AssetTableContainer>
  );
};

export default AssetTable;
