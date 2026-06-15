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
import { useTranslation } from 'react-i18next';

import { disableGuestAccess } from '../../../api/types/outgoing/moderation';
import { CloseIcon } from '../../../assets/icons';
import { useAppDispatch } from '../../../hooks';

const CloseIconButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(1),
  top: theme.spacing(1),
}));

interface DisableGuestAccessDialogProps {
  open: boolean;
  onClose: () => void;
}

const DisableGuestAccessDialog = ({ open, onClose }: DisableGuestAccessDialogProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const handleConfirm = () => {
    dispatch(disableGuestAccess.action());
    onClose();
  };

  return (
    <Dialog open={open} fullWidth maxWidth="xs" onClose={onClose}>
      <DialogTitle>{t('disable-guest-access-dialog-title')}</DialogTitle>
      <CloseIconButton aria-label={t('global-close-dialog')} onClick={onClose}>
        <CloseIcon />
      </CloseIconButton>
      <DialogContent>
        <Typography>{t('disable-guest-access-dialog-content')}</Typography>
      </DialogContent>
      <DialogActions>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
          }}
        >
          <Button onClick={onClose} variant="contained">
            {t('disable-guest-access-dialog-cancel')}
          </Button>
          <Button onClick={handleConfirm} color="danger" variant="contained">
            {t('disable-guest-access-dialog-confirm')}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default DisableGuestAccessDialog;
