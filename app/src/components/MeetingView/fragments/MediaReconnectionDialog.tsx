// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, CircularProgress, Typography, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useAppDispatch } from '../../../hooks';
import { hangUp } from '../../../store/commonActions';

const Overlay = styled('div')(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: theme.zIndex.modal,
}));

const Box = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(5),
  borderRadius: theme.borderRadius.card,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
}));

const DescriptionContainer = styled('div')({
  margin: '1.5rem 0',
});

const MediaReconnectionDialog = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  return (
    <Overlay>
      <Box>
        <CircularProgress color="primary" size="5rem" />
        <DescriptionContainer>
          <Typography variant="h6">{t('reconnection-media-title')}</Typography>
          <Typography variant="caption">{t('reconnection-media-description')}</Typography>
        </DescriptionContainer>
        <Button color="secondary" fullWidth onClick={() => dispatch(hangUp())}>
          {t('breakout-room-notification-button-leave')}
        </Button>
      </Box>
    </Overlay>
  );
};

export default MediaReconnectionDialog;
