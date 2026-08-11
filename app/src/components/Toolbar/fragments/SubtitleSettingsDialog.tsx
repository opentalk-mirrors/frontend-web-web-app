// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  Divider,
  MenuItem,
  Select,
  Stack,
  styled,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TranscriptionStatus } from '../../../api/types/incoming/transcription';
import { sendStartTranscriptionSignal, sendStopTranscriptionSignal } from '../../../api/types/outgoing/transcription';
import { CommonSwitch } from '../../../commonComponents';
import CommonDialogHeader from '../../../commonComponents/CommonDialogComponents/CommonDialogHeader';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import {
  hideTranscriptionSettings,
  TranscriptionLanguage,
  selectLanguage,
  selectTranscriptionStatus,
  setTranscriptionLanguage,
} from '../../../store/slices/transcriptionSlice';

const PlaceholderText = styled(Typography)(() => ({
  fontStyle: 'italic',
}));

const SubtitleSettingsDialog = (props: Omit<DialogProps, 'children'>) => {
  const { t } = useTranslation();
  const transcriptionLanguage = useAppSelector(selectLanguage);
  const transcriptionStatus = useAppSelector(selectTranscriptionStatus);
  const [desiredTranscriptionStatus, setDesiredTranscriptionStatus] = useState<boolean>(
    transcriptionStatus === TranscriptionStatus.Running
  ); // maps running to true, inactive to false
  const dispatch = useAppDispatch();
  const onClose = () => {
    dispatch(hideTranscriptionSettings());
    props.onClose?.({}, 'escapeKeyDown');
  };
  const submit = () => {
    // check if the desired status is the same as the current status, if so, just close the dialog
    if (desiredTranscriptionStatus === (transcriptionStatus === TranscriptionStatus.Running)) {
      onClose();
      return;
    }
    if (desiredTranscriptionStatus) {
      dispatch(
        sendStartTranscriptionSignal.action({
          language: transcriptionLanguage?.toString(),
        })
      );
    } else {
      dispatch(sendStopTranscriptionSignal.action());
    }
    onClose();
  };

  return (
    <Dialog {...props} onClose={onClose}>
      <CommonDialogHeader closeMenu={onClose} titleKey="subtitle-settings-dialog-title" />
      <Divider aria-hidden={true} />
      <DialogContent>
        <Stack>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 2,
              gap: 4,
            }}
          >
            <Typography component="label" htmlFor="enable-subtitles-switch">
              {t('subtitle-settings-enable-subtitles')}
            </Typography>
            <CommonSwitch
              id="enable-subtitles-switch"
              checked={desiredTranscriptionStatus}
              onChange={() => setDesiredTranscriptionStatus((prev) => !prev)}
            />
          </Box>
          <Box>
            <Typography variant="caption" component="label" htmlFor="input-language-select">
              {t('subtitle-settings-input-language')}
            </Typography>
            <Select
              renderValue={(lang) => {
                if (!lang) {
                  return <PlaceholderText>{t('subtitle-settings-input-language-error')}</PlaceholderText>;
                }
                return TranscriptionLanguage[lang as keyof typeof TranscriptionLanguage];
              }}
              disabled={!desiredTranscriptionStatus}
              displayEmpty
              id="input-language-select"
              value={transcriptionLanguage}
              onChange={(e) => dispatch(setTranscriptionLanguage(e.target.value as keyof typeof TranscriptionLanguage))}
            >
              {Object.keys(TranscriptionLanguage).map((key) => (
                <MenuItem key={key} value={key.toString()}>
                  {TranscriptionLanguage[key as keyof typeof TranscriptionLanguage]}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button type="button" color="primary" onClick={onClose}>
          {t('global-cancel')}
        </Button>
        <Button type="button" color="secondary" onClick={submit} disabled={!transcriptionLanguage}>
          {t('global-save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubtitleSettingsDialog;
