// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Button, Link as MUILink, LinkProps, Stack, styled, Tooltip } from '@mui/material';
import { RoomId } from '@opentalk/rest-api-rtk-query';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import { AssetRef } from '../../api/types/incoming/whiteboard';
import {
  generateWhiteboardPdf,
  start as startWhiteboard,
  startWhiteboard as startSpacedeck,
} from '../../api/types/outgoing/whiteboard';
import { showStorageNearLimitNotification } from '../../commonComponents/Notistack/helper';
import { useAppSelector } from '../../hooks';
import { useDownloadRoomAsset } from '../../hooks/useDownloadRoomAsset';
import { useStorageStatus } from '../../hooks/useStorageStatus';
import { selectIsSpacedeckEnabled, selectAccountManagementUrl } from '../../store/slices/configSlice';
import { selectIsModerator } from '../../store/slices/userSlice';
import { selectIsWhiteboardAvailable, selectWhiteboardAssets } from '../../store/slices/whiteboardSlice';

const Link = styled(MUILink)<LinkProps>(() => ({
  cursor: 'pointer',
}));

const WhiteboardTab = () => {
  const { t } = useTranslation();
  const whiteboardAssets: ReturnType<typeof selectWhiteboardAssets> = useAppSelector(selectWhiteboardAssets);
  const showWhiteboard: ReturnType<typeof selectIsWhiteboardAvailable> = useAppSelector(selectIsWhiteboardAvailable);
  const isModerator = useAppSelector(selectIsModerator);
  const accountManagementUrl = useAppSelector(selectAccountManagementUrl);
  const isSpacedeckEnabled = useAppSelector(selectIsSpacedeckEnabled);
  const dispatch = useDispatch();
  const downloadAsset = useDownloadRoomAsset();
  const { storageStatus, canUpgrade } = useStorageStatus();
  const { roomId } = useParams<'roomId'>() as { roomId: RoomId };

  const handleStartWhiteboard = () => {
    if (isSpacedeckEnabled) {
      dispatch(startSpacedeck.action());
      return;
    }
    dispatch(
      startWhiteboard.action({
        initialScene: {
          elements: [],
        },
        editRestrictions: {
          type: 'disabled',
        },
      })
    );
  };

  const createPdf = () => {
    if (isModerator) {
      showStorageNearLimitNotification({ storageStatus, canUpgrade, accountManagementUrl });
    }
    dispatch(generateWhiteboardPdf.action());
  };

  const handleDownload = async ({ assetId }: AssetRef) => {
    await downloadAsset({ roomId, assetId });
  };

  const renderButton = () => {
    if (!showWhiteboard) {
      return (
        <Button onClick={handleStartWhiteboard} color="secondary">
          {t('whiteboard-start-whiteboard-button')}
        </Button>
      );
    }
    if (!isSpacedeckEnabled) {
      return null;
    }

    if (storageStatus === 'full') {
      return (
        <Tooltip
          describeChild
          title={
            <Trans
              i18nKey={
                canUpgrade
                  ? 'conference-storage-tooltip-upgradeable-full-storage'
                  : 'conference-storage-tooltip-full-storage'
              }
              components={{
                accountManagementLink: accountManagementUrl ? (
                  <MUILink href={accountManagementUrl} target="_blank" />
                ) : (
                  <span />
                ),
              }}
            />
          }
          slotProps={{ tooltip: { sx: { bgcolor: 'error.dark' } } }}
        >
          <span>
            <Button onClick={createPdf} color="secondary" disabled fullWidth>
              {t('whiteboard-create-pdf-button')}
            </Button>
          </span>
        </Tooltip>
      );
    }
    return (
      <Button onClick={createPdf} color="secondary">
        {t('whiteboard-create-pdf-button')}
      </Button>
    );
  };

  return (
    <Stack
      spacing={1}
      sx={{
        height: '100%',
      }}
    >
      <Box
        sx={{
          mb: '0.5rem',
          width: '100%',
          height: '100%',
          overflow: 'auto',
          alignSelf: 'flex-start',
        }}
      >
        <Stack spacing={2}>
          {whiteboardAssets.map((asset) => {
            return (
              <Link component="button" key={asset.assetId} onClick={() => handleDownload(asset)}>
                {asset.filename}
              </Link>
            );
          })}
        </Stack>
      </Box>
      {renderButton()}
    </Stack>
  );
};

export default WhiteboardTab;
