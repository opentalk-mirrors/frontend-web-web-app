// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  styled,
} from '@mui/material';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

import { enableWaitingRoom, kickParticipant } from '../../../api/types/outgoing/moderation';
import { CloseIcon } from '../../../assets/icons';
import { notifications } from '../../../commonComponents';
import { useAppDispatch } from '../../../hooks';
import { Participant } from '../../../types';

const CloseIconButton = styled(IconButton)({
  position: 'absolute',
  right: 8,
  top: 8,
});

interface ParticipantRemovalDialogProps {
  open: boolean;
  participant: Participant;
  onClose: () => void;
}

const ParticipantRemovalDialog = ({ open, onClose, participant }: ParticipantRemovalDialogProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const handleConfirm = () => {
    dispatch(kickParticipant.action({ target: participant.id }));
    dispatch(enableWaitingRoom.action());
    const formatKickedTime = format(Date.parse(new Date().toISOString()), 'HH:mm');
    notifications.info(
      t('meeting-notification-user-was-kicked', { user: participant.displayName, time: formatKickedTime })
    );
    onClose();
  };

  return (
    <Dialog open={open} fullWidth maxWidth="xs" onClose={onClose}>
      <DialogTitle>{t('participant-remove-dialog-title')}</DialogTitle>
      <CloseIconButton aria-label={t('global-close-dialog')} onClick={onClose}>
        <CloseIcon />
      </CloseIconButton>
      <DialogContent>
        <Typography>
          {t('participant-remove-dialog-content', { name: participant.displayName ?? t('global-participant') })}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <Button onClick={onClose} color="danger" variant="contained">
            {t('participant-remove-dialog-cancel')}
          </Button>
          {/* eslint-disable jsx-a11y/no-autofocus */}
          {/* Without the autoFocus here ORCA screenreader will not announce the dialog at all, when it appears on the screen
			   Trade-off for this, NVDA reads out some content doubled, which can be fixed in NVDA settings itself
			   https://github.com/nvaccess/nvda/issues/8971#issuecomment-1758193765
			   */}
          <Button onClick={handleConfirm} color="primary" variant="contained" autoFocus>
            {t('participant-remove-dialog-confirm')}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ParticipantRemovalDialog;
