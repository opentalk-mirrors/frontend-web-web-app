// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Button, CircularProgress, Dialog, DialogContent, Typography, styled } from '@mui/material';
import { useId, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '../../../hooks';
import { hangUp } from '../../../store/commonActions';
import {
  selectBreakoutClosedAt,
  selectLastDispatchedActionType,
  breakoutSlice,
} from '../../../store/slices/breakoutSlice';

const DescriptionContainer = styled('div')({
  margin: '1.5rem 0',
});

const MAX_ROOM_SWITCHING_TIME_SECONDS = 3;
const isWithinSwitchWindow = (timestamp: number) => (Date.now() - timestamp) / 1000 <= MAX_ROOM_SWITCHING_TIME_SECONDS;

const MediaReconnectionDialog = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const lastDispatchedActionType = useAppSelector(selectLastDispatchedActionType);
  const breakoutClosedAt = useAppSelector(selectBreakoutClosedAt);

  const switchingByAction = lastDispatchedActionType === breakoutSlice.actions.switchedRoom.type;
  const switchingByRecentClose = typeof breakoutClosedAt === 'number' && isWithinSwitchWindow(breakoutClosedAt);
  const isSwitchingRooms = switchingByAction || switchingByRecentClose;

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
