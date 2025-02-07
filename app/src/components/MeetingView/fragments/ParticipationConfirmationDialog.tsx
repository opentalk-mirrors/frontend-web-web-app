// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { batch } from 'react-redux';

import { confirmPresence } from '../../../api/types/outgoing/trainingParticipationReport';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { presenceConfirmationDone, selectIsParticipationConfirmationActive } from '../../../store/slices/roomSlice';

export const ParticipationConfirmationDialog = () => {
  const confirmationCheckpointOngoing = useAppSelector(selectIsParticipationConfirmationActive);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const handleConfirm = () => {
    batch(() => {
      dispatch(confirmPresence.action());
      dispatch(presenceConfirmationDone());
    });
  };

  return (
    <Dialog open={confirmationCheckpointOngoing} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ textAlign: 'left' }}>{t('participation-confirmation-dialog-title')}</DialogTitle>
      <DialogContent>
        <Typography>{t('participation-confirmation-dialog-description')}</Typography>
      </DialogContent>
      <DialogActions>
        {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
        <Button onClick={handleConfirm} color="primary" variant="contained" autoFocus>
          {t('participation-confirmation-dialog-confirm-button')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
