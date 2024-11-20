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
  handleDownload: ({ assetId, filename, fileSize, updateDownloadProgress }: AssetDownloadBaseInfo) => void;
  handleDelete?: (assetId: AssetId) => void;
  progress?: number;
}

const DownloadButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'progressPercentage',
})<{ progressPercentage?: number }>(({ theme, progressPercentage }) => ({
  marginRight: theme.spacing(1),

  backgroundImage:
    progressPercentage !== undefined
      ? `linear-gradient(to right, ${theme.palette.warning.main} ${progressPercentage}%, ${theme.palette.text.disabled} ${progressPercentage}%)`
      : undefined,
}));

export const AssetTableRow = ({ asset, handleDownload, handleDelete, progress }: AssetTableRowProps) => {
  const { t } = useTranslation();
  const isDisabled = progress !== undefined;
  const { id: assetId, filename, size, createdAt } = asset;

  return (
    <TableRow key={assetId}>
      <TableCell>{filename}</TableCell>
      <TableCell>{format(new Date(createdAt), 'HH:mm dd.MM.yyyy')}</TableCell>
      <TableCell>{formatBytes(size)}</TableCell>
      <TableCell>
        <Stack spacing={0.5} direction="column">
          <DownloadButton
            color="secondary"
            onClick={() => handleDownload({ assetId, filename, fileSize: size })}
            disabled={isDisabled}
            progressPercentage={progress}
            fullWidth
          >
            {t(isDisabled ? 'download-in-progress' : 'action-download')}
          </DownloadButton>
          {handleDelete && (
            <Button color="error" onClick={() => handleDelete(assetId)} disabled={isDisabled} fullWidth>
              {t('action-delete')}
            </Button>
          )}
        </Stack>
      </TableCell>
    </TableRow>
  );
};
