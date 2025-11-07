// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Button, IconButton } from '@mui/material';
import { Dialog, DialogActions, DialogTitle } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { CloseIcon } from '../../../assets/icons';
import { useAppDispatch } from '../../../hooks';
import { useInviteCode } from '../../../hooks/useInviteCode';
import { hangUp } from '../../../store/commonActions';

interface MeetingEndedDialogProps {
  setIsDialogOpen: (isDialogOpen: boolean) => void;
}

const MeetingEndedDialog = ({ setIsDialogOpen }: MeetingEndedDialogProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const inviteCode = useInviteCode();

  const handleClose = () => {
    setIsDialogOpen(false);
  };

  return (
    <Dialog open onClose={handleClose} aria-labelledby="meeting-ended-title">
      <DialogTitle id="meeting-ended-title">
        {t('meeting-ended-dialog-title')}
        <Box
          sx={{
            position: 'absolute',
            top: 7,
            right: 7,
          }}
        >
          <IconButton onClick={handleClose} aria-label={t('global-close-dialog')}>
            <CloseIcon aria-hidden="true" />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogActions>
        <Button color="secondary" onClick={handleClose}>
          {t('global-close-dialog')}
        </Button>
        <Button
          color="primary"
          onClick={() => {
            dispatch(hangUp());
            !inviteCode && navigate('/dashboard');
          }}
        >
          {t('meeting-ended-dialog-button-title')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MeetingEndedDialog;
