// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  Dialog,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Box,
  styled,
  FormLabel,
  Typography,
  DialogContent,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { useTranslation } from 'react-i18next';

import { CloseIcon } from '../../../assets/icons';
import { CommonSwitch } from '../../../commonComponents';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { selectHotkeysEnabled, setHotkeysEnabled } from '../../../store/slices/uiSlice';
import HotkeyTable from './HotkeyTable';

interface HotkeyDialogProps {
  onClose: () => void;
  open: boolean;
}

const CloseButton = styled(IconButton)(() => ({
  position: 'absolute',
  right: 5,
  top: '50%',
  transform: 'translateY(-50%)',
}));

const SwitchLabel = styled(FormLabel)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontWeight: 300,
}));

const DeactivatedContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  color: theme.palette.text.primary,
  fontWeight: 500,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  aspectRatio: '2/1',
}));

const HotkeyDialog = (props: HotkeyDialogProps) => {
  const { t } = useTranslation();
  const { onClose, open } = props;
  const switchId = 'switch-shortcut-activation';
  const dispatch = useAppDispatch();
  const hotkeysEnabled = useAppSelector(selectHotkeysEnabled);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperComponent={Paper}
      aria-describedby="shortcut-dialog-description"
    >
      <DialogContent>
        <Typography id="shortcut-dialog-description" sx={visuallyHidden}>
          {t('shortcut-table-summary')}
        </Typography>
        <Stack component="header" spacing={4}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
            }}
          >
            <DialogTitle sx={{ p: 0 }}>{t('my-meeting-menu-keyboard-hotkeys')}</DialogTitle>
            <CloseButton aria-label={t('global-close-dialog')} onClick={onClose} edge="end">
              <CloseIcon />
            </CloseButton>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
            }}
          >
            <SwitchLabel htmlFor={switchId}>{t('my-meeting-menu-activate-hotkeys')}</SwitchLabel>
            <CommonSwitch
              id={switchId}
              checked={hotkeysEnabled}
              onChange={() => dispatch(setHotkeysEnabled(!hotkeysEnabled))}
              /* eslint-disable jsx-a11y/no-autofocus */
              // We want screen reader to jump to the first interactive element
              // upon reveal and start pronouncing content of the dialog.
              autoFocus
              color="primary"
            />
          </Box>
          {hotkeysEnabled ? (
            <HotkeyTable />
          ) : (
            <DeactivatedContainer>{t('hotkey-disabled-message')}</DeactivatedContainer>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default HotkeyDialog;
