// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, DialogContent } from '@mui/material';
import { Dialog, DialogActions, DialogTitle } from '@mui/material';
import { selectIsAuthenticated } from '@opentalk/redux-oidc';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useAppSelector } from '../../../hooks';

const MeetingEndedDialog = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  return (
    <Dialog open aria-labelledby="meeting-ended-title" aria-describedby="meeting-ended-description">
      <DialogTitle id="meeting-ended-title">{t('meeting-ended-dialog-title')}</DialogTitle>
      <DialogContent id="meeting-ended-description">{t('meeting-ended-dialog-description')}</DialogContent>
      {isAuthenticated && (
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
