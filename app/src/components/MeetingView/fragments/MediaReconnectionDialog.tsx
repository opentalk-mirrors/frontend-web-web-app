// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Button, CircularProgress, Dialog, DialogContent, Typography, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useAppDispatch } from '../../../hooks';
import { hangUp } from '../../../store/commonActions';

const DescriptionContainer = styled('div')({
  margin: '1.5rem 0',
});

const MediaReconnectionDialog = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  return (
    <Dialog open>
      <DialogContent>
        <Box textAlign="center">
          <CircularProgress color="primary" size="5rem" />
        </Box>
        <DescriptionContainer>
          <Typography variant="h6">{t('reconnection-media-title')}</Typography>
          <Typography variant="caption">{t('reconnection-media-description')}</Typography>
        </DescriptionContainer>
        <Button color="secondary" fullWidth onClick={() => dispatch(hangUp())}>
          {t('breakout-room-notification-button-leave')}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default MediaReconnectionDialog;
