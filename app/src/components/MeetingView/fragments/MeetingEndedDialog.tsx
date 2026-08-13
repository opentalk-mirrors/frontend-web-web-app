// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, DialogContent } from '@mui/material';
import { Dialog, DialogActions, DialogTitle } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useInviteCode } from '../../../hooks/useInviteCode';

const MeetingEndedDialog = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const inviteCode = useInviteCode();

  return (
    <Dialog open aria-labelledby="meeting-ended-title" aria-describedby="meeting-ended-description">
      <DialogTitle id="meeting-ended-title">{t('meeting-ended-dialog-title')}</DialogTitle>
      <DialogContent id="meeting-ended-description">{t('meeting-ended-dialog-description')}</DialogContent>
      {!inviteCode && (
        <DialogActions>
          <Button
            color="secondary"
            onClick={() => {
              navigate('/dashboard');
            }}
          >
            {t('meeting-ended-dialog-button-title')}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default MeetingEndedDialog;
