// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Button, Link as MUILink, LinkProps, Stack, styled } from '@mui/material';
import { RoomId } from '@opentalk/rest-api-rtk-query';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import { AssetRef } from '../../api/types/incoming/whiteboard';
import { generateWhiteboardPdf, startWhiteboard } from '../../api/types/outgoing/whiteboard';
import { useAppSelector } from '../../hooks';
import { useDownloadRoomAsset } from '../../hooks/useDownloadRoomAsset';
import { selectIsWhiteboardAvailable, selectWhiteboardAssets } from '../../store/slices/whiteboardSlice';

const Link = styled(MUILink)<LinkProps>(() => ({
  cursor: 'pointer',
}));

const WhiteboardTab = () => {
  const { t } = useTranslation();
  const whiteboardAssets: ReturnType<typeof selectWhiteboardAssets> = useAppSelector(selectWhiteboardAssets);
  const showWhiteboard: ReturnType<typeof selectIsWhiteboardAvailable> = useAppSelector(selectIsWhiteboardAvailable);
  const dispatch = useDispatch();
  const downloadAsset = useDownloadRoomAsset();
  const { roomId } = useParams<'roomId'>() as { roomId: RoomId };

  const handleStartWhiteboard = () => {
    dispatch(startWhiteboard.action());
  };

  const createPdf = () => {
    dispatch(generateWhiteboardPdf.action());
  };

  const handleDownload = ({ assetId, filename }: AssetRef) => {
    downloadAsset({ roomId, assetId, filename });
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
      {showWhiteboard ? (
        <Button onClick={createPdf}>{t('whiteboard-create-pdf-button')}</Button>
      ) : (
        <Button onClick={handleStartWhiteboard}>{t('whiteboard-start-whiteboard-button')}</Button>
      )}
    </Stack>
  );
};

export default WhiteboardTab;
