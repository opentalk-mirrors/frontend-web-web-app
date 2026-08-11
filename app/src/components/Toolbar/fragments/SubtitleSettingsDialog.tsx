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

import {
  TranscriptionStatus,
  TranscriptionLanguage,
  TranscriptionLanguageKey,
} from '../../../api/types/incoming/transcription';
import {
  changeTranscriptionLanguageSignal,
  sendStartTranscriptionSignal,
  sendStopTranscriptionSignal,
} from '../../../api/types/outgoing/transcription';
import { CommonSwitch } from '../../../commonComponents';
import CommonDialogHeader from '../../../commonComponents/CommonDialogComponents/CommonDialogHeader';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import {
  hideTranscriptionSettings,
  saveTranscriptionLanguageToLocalStorage,
  selectTranscriptionLanguage,
  selectTranscriptionStatus,
} from '../../../store/slices/transcriptionSlice';

const PlaceholderText = styled(Typography)(() => ({
  fontStyle: 'italic',
}));

const SubtitleSettingsDialog = (props: Omit<DialogProps, 'children'>) => {
  const { t } = useTranslation();
  const transcriptionLanguage = useAppSelector(selectTranscriptionLanguage);
  const transcriptionStatus = useAppSelector(selectTranscriptionStatus);
  const [desiredTranscriptionStatus, setDesiredTranscriptionStatus] = useState<boolean>(
    transcriptionStatus === TranscriptionStatus.Running
  ); // maps running to true, inactive to false
  const [desiredTranscriptionLanguage, setDesiredTranscriptionLanguage] = useState<TranscriptionLanguageKey | ''>(
    transcriptionLanguage || ''
  );
  const dispatch = useAppDispatch();
  const hasLanguageChanged = desiredTranscriptionLanguage && desiredTranscriptionLanguage !== transcriptionLanguage;
  const hasStatusChanged = desiredTranscriptionStatus !== (transcriptionStatus === TranscriptionStatus.Running);

  const onClose = () => {
    dispatch(hideTranscriptionSettings());
    props.onClose?.({}, 'escapeKeyDown');
  };

  const onLanguageSelectChange = (selectedLanguage: TranscriptionLanguageKey) => {
    if (selectedLanguage === desiredTranscriptionLanguage) {
      return;
    }
    setDesiredTranscriptionLanguage(selectedLanguage);
  };

  const submit = () => {
    if (hasLanguageChanged) {
      saveTranscriptionLanguageToLocalStorage(desiredTranscriptionLanguage);
      // check if the desired status is the same as the current status, if so, just close the dialog
      if (!hasStatusChanged) {
        // check if the language has changed, if so, send a change language signal
        dispatch(changeTranscriptionLanguageSignal.action({ language: desiredTranscriptionLanguage }));
      }
    }
    if (!hasStatusChanged) {
      onClose();
      return;
    }
    if (desiredTranscriptionStatus) {
      dispatch(
        sendStartTranscriptionSignal.action({
          language: desiredTranscriptionLanguage.toString(),
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
              renderValue={(lang: TranscriptionLanguageKey | '') => {
                if (!lang) {
                  return <PlaceholderText>{t('subtitle-settings-input-language-error')}</PlaceholderText>;
                }
                return TranscriptionLanguage[lang];
              }}
              disabled={!desiredTranscriptionStatus}
              displayEmpty
              inputProps={{ id: 'input-language-select' }}
              value={desiredTranscriptionLanguage}
              onChange={(e) => onLanguageSelectChange(e.target.value as TranscriptionLanguageKey)}
            >
              {Object.keys(TranscriptionLanguage).map((key) => (
                <MenuItem key={key} value={key.toString()}>
                  {TranscriptionLanguage[key as TranscriptionLanguageKey]}
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
        <Button type="button" color="secondary" onClick={submit} disabled={!desiredTranscriptionLanguage}>
          {t('global-save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubtitleSettingsDialog;
