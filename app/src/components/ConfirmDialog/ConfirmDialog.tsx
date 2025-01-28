// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { CloseIcon } from '../../assets/icons';

export interface ConfirmDialogProps {
  submitButtonText: string;
  cancelButtonText: string;
  onConfirm: () => void;
  onCancel: () => void;
  onClose?: () => void;
  message: string;
  title: string;
  open: boolean;
  onMouseDown?: (mouseEvent: React.MouseEvent<HTMLDivElement>) => void;
}

export const ConfirmDialog = ({
  submitButtonText,
  cancelButtonText,
  onConfirm,
  onCancel,
  onClose,
  message,
  title,
  open,
  onMouseDown,
}: ConfirmDialogProps) => {
  const { t } = useTranslation();
  const handleClose = onClose || onCancel;
  return (
    <Dialog open={open} maxWidth="sm" fullWidth onMouseDown={onMouseDown} onClose={handleClose}>
      <DialogTitle sx={{ textAlign: 'left' }}>{title}</DialogTitle>
      <Box
        sx={{
          position: 'absolute',
          top: 5,
          right: 5,
        }}
      >
        <IconButton aria-label={t('global-close-dialog')} onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary" variant="contained">
          {cancelButtonText}
        </Button>
        <Button onClick={onConfirm} color="secondary" variant="contained">
          {submitButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
