// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Button, CircularProgress, Dialog, DialogContent, Typography, styled } from '@mui/material';
import { useId, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '../../../hooks';
import { hangUp } from '../../../store/commonActions';
import { selectSwitchingRooms } from '../../../store/slices/livekitSlice';

const DescriptionContainer = styled('div')({
  margin: '1.5rem 0',
});

const MediaReconnectionDialog = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isSwitchingRooms = useAppSelector(selectSwitchingRooms);

  const { title, description } = useMemo(() => {
    if (isSwitchingRooms) {
      return {
        title: t('breakout-switching-title'),
        description: t('breakout-switching-description'),
      };
    }
    return {
      title: t('reconnection-media-title'),
      description: t('reconnection-media-description'),
    };
  }, [isSwitchingRooms, t]);

  const titleId = useId();
  const descId = useId();

  return (
    <Dialog aria-labelledby={titleId} aria-describedby={descId} open>
      <DialogContent>
        <Box textAlign="center">
          <CircularProgress color="primary" size="5rem" />
        </Box>
        <DescriptionContainer>
          <Typography id={titleId} variant="h6">
            {title}
          </Typography>
          <Typography id={descId} variant="caption">
            {description}
          </Typography>
        </DescriptionContainer>
        <Button color="secondary" fullWidth onClick={() => dispatch(hangUp())}>
          {t('breakout-room-notification-button-leave')}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default MediaReconnectionDialog;
