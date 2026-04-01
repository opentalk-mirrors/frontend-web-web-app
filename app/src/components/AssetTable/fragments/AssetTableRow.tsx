// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, TableRow, TableCell, styled, Stack } from '@mui/material';
import { AssetId, BaseAsset } from '@opentalk/rest-api-rtk-query';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

import { AssetDownloadBaseInfo } from '../../../hooks/useDownloadRoomAsset';
import { formatBytes } from '../../../utils/numberUtils';

interface AssetTableRowProps {
  asset: BaseAsset;
  handleDownload: ({ assetId }: AssetDownloadBaseInfo) => void;
  handleDelete?: (assetId: AssetId) => void;
  progress?: number;
  disabledDownload?: boolean;
  disabledDelete?: boolean;
}

const DownloadButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'progressPercentage',
})<{ progressPercentage?: number }>(({ theme, progressPercentage }) => ({
  backgroundImage:
    progressPercentage !== undefined
      ? `linear-gradient(to right, ${theme.palette.warning.main} ${progressPercentage}%, ${theme.palette.text.disabled} ${progressPercentage}%)`
      : undefined,
}));

export const AssetTableRow = ({
  asset,
  handleDownload,
  handleDelete,
  progress,
  disabledDelete,
  disabledDownload,
}: AssetTableRowProps) => {
  const { t } = useTranslation();
  const { id: assetId, filename, size, createdAt } = asset;

  return (
    <TableRow key={assetId}>
      <TableCell sx={{ width: '100%' }} scope="row">
        {filename}
      </TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{format(new Date(createdAt), 'HH:mm dd.MM.yyyy')}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatBytes(size)}</TableCell>
      <TableCell>
        <Stack spacing={1} direction="row">
          <DownloadButton
            onClick={() => handleDownload({ assetId })}
            disabled={disabledDownload}
            progressPercentage={progress}
            size="small"
          >
            {t(disabledDownload ? 'download-in-progress' : 'action-download')}
          </DownloadButton>
          {handleDelete && (
            <Button color="danger" onClick={() => handleDelete(assetId)} disabled={disabledDelete} size="small">
              {t('action-delete')}
            </Button>
          )}
        </Stack>
      </TableCell>
    </TableRow>
  );
};
