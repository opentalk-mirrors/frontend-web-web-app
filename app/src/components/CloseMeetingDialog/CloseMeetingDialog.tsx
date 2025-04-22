// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import { EventId, EventStatus, EventType, RoomId } from '@opentalk/rest-api-rtk-query';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import {
  useDeleteEventMutation,
  useDeleteRoomMutation,
  useGetEventQuery,
  useUpdateEventInstanceMutation,
} from '../../api/rest';
import { CloseIcon } from '../../assets/icons';
import { notifications } from '../../commonComponents';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { useFullscreenContext } from '../../hooks/useFullscreenContext';
import log from '../../logger';
import { hangUp } from '../../store/commonActions';
import { selectEventInfo } from '../../store/slices/roomSlice';
import { EventDeletionType, generateInstanceId } from '../../utils/eventUtils';

export interface CloseMeetingDialogProps {
  open: boolean;
  onClose: () => void;
  container: HTMLElement | null;
}

const DIALOG_DESCRIPTION_ID = 'close-meeting-dialog-description-id';
const DIALOG_TITLE_ID = 'close-meeting-dialog-label-id';

export const CloseMeetingDialog = ({ open, onClose }: CloseMeetingDialogProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { roomId } = useParams<'roomId'>() as {
    roomId: RoomId;
  };
  const eventInfo = useAppSelector(selectEventInfo);
  const [updateEventInstance] = useUpdateEventInstanceMutation();
  const [deleteRoom] = useDeleteRoomMutation();
  const [deleteEvent, { isLoading: isDeleting, isSuccess: isDeleted }] = useDeleteEventMutation();
  const { data: eventData } = useGetEventQuery(
    { eventId: eventInfo?.id as EventId },
    { skip: isDeleting || isDeleted }
  );
  const [disableLeaveAndDeleteButton, setDisableLeaveAndDeleteButton] = useState(true);
  const [deletionMode, setDeletionMode] = useState<EventDeletionType | null>(null);
  const dispatch = useAppDispatch();

  const handleCheckbox = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setDisableLeaveAndDeleteButton(!event.target.checked);
  }, []);

  const handleDeletionModeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setDeletionMode((event.target as HTMLInputElement).value as EventDeletionType);
    setDisableLeaveAndDeleteButton(!event.target.checked);
  }, []);

  const handleHangUp = useCallback(() => dispatch(hangUp()), [dispatch]);

  const handleDelete = async () => {
    const eventId = eventData?.id;
    try {
      if (eventId) {
        await deleteEvent(eventId).unwrap();
      } else {
        await deleteRoom(roomId).unwrap();
      }
    } catch (e) {
      log.debug('Error while deleting room or event:', e);
    }
  };

  const handleLeaveButton = async () => {
    try {
      switch (eventData?.type) {
        case EventType.Single:
          await handleDelete();
          break;
        case EventType.Recurring:
          if (deletionMode === EventDeletionType.One) {
            updateEventInstance({
              eventId: eventData.id,
              instanceId: generateInstanceId(eventData.startsAt),
              status: EventStatus.Cancelled,
            });
          } else if (deletionMode === EventDeletionType.All) {
            await handleDelete();
          }
          break;
      }
      handleHangUp();
      notifications.success(t('meeting-delete-successfully-deleted'));
      navigate('/dashboard');
    } catch (e) {
      log.error('error on delete room meta data: %s', JSON.stringify(e));
      notifications.error(t('meeting-delete-metadata-submit-error'));
    }
  };

  const singleConfigurationForm = () => (
    <DialogContent>
      <Typography id={DIALOG_DESCRIPTION_ID}>{t('meeting-delete-metadata-dialog-message')}</Typography>
      <Grid
        sx={{
          mt: 1,
        }}
      >
        <FormControlLabel
          control={<Checkbox checked={!disableLeaveAndDeleteButton} onChange={handleCheckbox} />}
          label={t('meeting-delete-metadata-dialog-checkbox')}
          labelPlacement="end"
        />
      </Grid>
    </DialogContent>
  );
  const recurringConfigurationForm = () => (
    <DialogContent>
      <Typography id={DIALOG_DESCRIPTION_ID}>{t('meeting-delete-recurring-metadata-dialog-message')}</Typography>
      <Grid
        sx={{
          mt: 1,
        }}
      >
        <FormControl>
          <RadioGroup onChange={handleDeletionModeChange}>
            <FormControlLabel
              value={EventDeletionType.One}
              control={<Radio />}
              label={t('meeting-delete-recurring-dialog-radio-single')}
            />
            <FormControlLabel
              value={EventDeletionType.All}
              control={<Radio />}
              label={t('meeting-delete-recurring-dialog-radio-all')}
            />
          </RadioGroup>
        </FormControl>
      </Grid>
    </DialogContent>
  );

  const getConfigurationForm = () => {
    switch (eventData?.type) {
      case EventType.Single:
        return singleConfigurationForm();
      case EventType.Recurring:
        return recurringConfigurationForm();
    }
  };

  const handleFullscreen = useFullscreenContext();

  useEffect(() => {
    handleFullscreen.setHasActiveOverlay(true);

    return () => {
      handleFullscreen.setHasActiveOverlay(false);
    };
  }, [handleFullscreen]);

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      container={handleFullscreen.rootElement}
      onClose={onClose}
      aria-describedby={DIALOG_DESCRIPTION_ID}
      aria-labelledby={DIALOG_TITLE_ID}
      ref={(node) => node?.focus()}
      role="dialog"
    >
      <DialogTitle id={DIALOG_TITLE_ID} aria-hidden="true" sx={{ textAlign: 'left' }}>
        {t('meeting-delete-metadata-dialog-title')}
      </DialogTitle>
      <Box
        sx={{
          position: 'absolute',
          top: 5,
          right: 5,
        }}
      >
        <IconButton onClick={onClose} aria-label={t('global-close-dialog')}>
          <CloseIcon />
        </IconButton>
      </Box>
      {getConfigurationForm()}
      <DialogActions>
        <Button onClick={handleLeaveButton} color="error" variant="contained" disabled={disableLeaveAndDeleteButton}>
          {t('meeting-delete-metadata-button-leave-and-delete')}
        </Button>
        {/* eslint-disable jsx-a11y/no-autofocus */}
        {/* Without the autoFocus here ORCA screenreader will not announce the dialog at all, when it appears on the screen
        Trade-off for this, NVDA reads out some content doubled, which can be fixed in NVDA settings itself
        https://github.com/nvaccess/nvda/issues/8971#issuecomment-1758193765
        */}
        <Button onClick={handleHangUp} color="primary" variant="contained" autoFocus>
          {t('meeting-delete-metadata-button-leave-without-delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CloseMeetingDialog;
