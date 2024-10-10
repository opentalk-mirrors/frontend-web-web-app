// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import { RecurringEvent, SingleEvent } from '@opentalk/rest-api-rtk-query';
import { truncate } from 'lodash';
import { useTranslation } from 'react-i18next';

import { CloseIcon } from '../../../assets/icons';
import EventTimePreview from '../../EventTimePreview';

interface EventConflictDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
  event: SingleEvent | RecurringEvent;
  isUpdate?: boolean;
}

export const EventConflictDialog = ({ onConfirm, onCancel, event, isUpdate }: EventConflictDialogProps) => {
  const { t } = useTranslation();
  const startDate = new Date(event.startsAt.datetime);
  const endDate = new Date(event.endsAt.datetime);

  const eventTitle = truncate(event.title, { length: 20 });

  return (
    <Dialog open maxWidth="sm" fullWidth disablePortal onClose={onCancel}>
      <DialogTitle sx={{ textAlign: 'left' }}>{t('dashboard-create-meeting-dialog-title')}</DialogTitle>
      <Box position="absolute" top={0} right={0}>
        <IconButton aria-label={t('global-close-dialog')} onClick={onCancel}>
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent>
        <Typography mb={1}>{t('dashboard-create-or-update-meeting-dialog-message')}</Typography>
        <Typography component="span" variant="h1" ml={0}>
          {eventTitle}{' '}
        </Typography>
        <Typography component="span">
          <EventTimePreview startDate={startDate} endDate={endDate} />
        </Typography>
        <Typography mt={1}>{t(`dashboard-${isUpdate ? 'update' : 'create'}-meeting-dialog-prompt`)}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onConfirm} color="primary" variant="contained">
          {t(`dashboard-${isUpdate ? 'update' : 'create'}-meeting-dialog-ok`)}
        </Button>
        <Button onClick={onCancel} color="secondary" variant="contained">
          {t('dashboard-create-meeting-dialog-cancel')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventConflictDialog;
