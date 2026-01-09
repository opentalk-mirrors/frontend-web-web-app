// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, styled } from '@mui/material';
import { AssetId, BaseAsset } from '@opentalk/rest-api-rtk-query';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AssetDownloadBaseInfo } from '../../hooks/useDownloadRoomAsset';
import log from '../../logger';
import { AssetTableRow } from './fragments/AssetTableRow';

// `component` prop lost when wrapping with `styled`
// https://github.com/mui/material-ui/issues/29875
const AssetTableContainer = styled(TableContainer, {
  shouldForwardProp: (prop) => prop !== 'maxHeight',
})<{ maxHeight?: string | number; component?: React.ElementType }>(({ theme, maxHeight }) => ({
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
  maxHeight,

  '&.MuiPaper-root': {
    background: theme.palette.background.main.primary,
    color: theme.palette.background.main.contrastText,
  },

  '& .MuiTableHead-root .MuiTableCell-root': {
    background: theme.palette.background.highlight.primary,
    color: theme.palette.background.highlight.contrastText,
    fontWeight: theme.typography.fontWeightBold,
  },

  '& .MuiTableBody-root .MuiTableCell-root': {
    borderBottomColor: theme.palette.divider,
    color: theme.palette.text.primary,
  },
}));

interface AssetTableProps {
  assets: Array<BaseAsset>;
  onDownload: ({ assetId }: AssetDownloadBaseInfo) => Promise<void>;
  onDelete?: (assetId: AssetId) => Promise<void | { data: void } | { error: FetchBaseQueryError | SerializedError }>;
  maxHeight?: string;
}

type AssetRowState = Record<
  AssetId,
  {
    downloading: boolean;
    progress: number;
    deleting: boolean;
  }
>;

/*
  If onDelete function is set => the assets are deletable and `Delete` button will be exposed in the UI
  Otherwise we show only the `Download` button
*/
export const AssetTable = ({ assets, onDownload, onDelete, maxHeight = 'none' }: AssetTableProps) => {
  const { t } = useTranslation();
  const [assetRows, setAssetRows] = useState<AssetRowState>({});

  const updateAssetRowState = (assetId: AssetId, newState: Partial<AssetRowState[AssetId]>) => {
    setAssetRows((state) => ({
      ...state,
      [assetId]: {
        ...state[assetId],
        ...newState,
      },
    }));
  };

  // While downloading we disable buttons in the relevant row
  const handleDownload = async ({ assetId }: Omit<AssetDownloadBaseInfo, 'onDownloadProgress'>) => {
    try {
      updateAssetRowState(assetId, { downloading: true, progress: 0, deleting: false });
      await onDownload({
        assetId,
      });
      updateAssetRowState(assetId, { downloading: false, progress: 0, deleting: false });
    } catch (error) {
      log.error('Error downloading asset', error);
      updateAssetRowState(assetId, { downloading: false, progress: 0, deleting: false });
    }
  };

  // While deleting we disable buttons in the relevant row
  const handleDelete = onDelete
    ? async (assetId: AssetId) => {
        if (onDelete) {
          try {
            updateAssetRowState(assetId, { deleting: true, downloading: false });
            await onDelete(assetId);
            setAssetRows((state) => {
              const newState = { ...state };
              delete newState[assetId];
              return newState;
            });
          } catch (error) {
            log.error('Error deleting asset', error);
            updateAssetRowState(assetId, { deleting: false, downloading: false });
          }
        }
      }
    : undefined;

  const renderTableRows = () => {
    return assets?.map((asset) => {
      const rowState = assetRows[asset.id];

      return (
        <AssetTableRow
          key={asset.id}
          asset={asset}
          handleDownload={handleDownload}
          handleDelete={handleDelete}
          progress={rowState?.progress > 0 ? rowState.progress : undefined}
          disabledDownload={rowState?.downloading}
          disabledDelete={rowState?.deleting}
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
