// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { notifications } from '../../commonComponents';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { changeMedia } from '../../store/commonActions';
import { selectAudioEnabled, selectVideoEnabled } from '../../store/slices/livekitSlice';
import { abortedReconnection } from '../../store/slices/roomSlice';

const ReconnectionDialog = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const videoEnabled = useAppSelector(selectVideoEnabled);
  const audioEnabled = useAppSelector(selectAudioEnabled);

  const handleAbortReconnectionLoop = useCallback(async () => {
    try {
      if (audioEnabled) {
        dispatch(changeMedia({ kind: 'audioinput', enabled: false }));
      }
      if (videoEnabled) {
        dispatch(changeMedia({ kind: 'videoinput', enabled: false }));
      }
    } catch (e) {
      console.error('Failed to disable media:', e);
      notifications.error(t('error-general'));
    } finally {
      dispatch(abortedReconnection());
    }
  }, [audioEnabled, videoEnabled, dispatch, t]);

  return (
    <Dialog open fullWidth maxWidth="xs">
      <DialogTitle>{t('reconnection-loop-dialogbox-title')}</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button fullWidth onClick={handleAbortReconnectionLoop} color="secondary">
          {t('reconnection-loop-abort-button')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReconnectionDialog;
