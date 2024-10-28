// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { useMaybeRoomContext } from '@livekit/components-react';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useAppDispatch } from '../../hooks';
import { useMediaChoices } from '../../provider/MediaChoicesProvider';
import { abortedReconnection } from '../../store/slices/roomSlice';

const ReconnectionDialog = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const room = useMaybeRoomContext();
  const mediaChoices = useMediaChoices();

  const disableMedia = async () => {
    if (mediaChoices?.userChoices.audioEnabled) {
      mediaChoices?.saveAudioInputEnabled(true);
      room?.localParticipant.setMicrophoneEnabled(false);
    }
    if (mediaChoices?.userChoices.videoEnabled) {
      mediaChoices?.saveVideoInputEnabled(true);
      room?.localParticipant.setCameraEnabled(false);
    }
  };

  const abort = () => {
    disableMedia();
    dispatch(abortedReconnection());
  };

  return (
    <Dialog open fullWidth maxWidth="xs">
      <DialogTitle>{t('reconnection-loop-dialogbox-title')}</DialogTitle>
      <DialogContent>
        <Box display="flex" alignItems="center" justifyContent="center">
          <CircularProgress />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button fullWidth onClick={abort}>
          {t('reconnection-loop-abort-button')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReconnectionDialog;
