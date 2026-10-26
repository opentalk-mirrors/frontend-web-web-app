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

import { TranscriptionLanguage, TranscriptionLanguageKey } from '../../../api/types/incoming/transcription';
import {
  changeTranscriptionLanguageSignal,
  sendStartTranscriptionSignal,
  sendStopTranscriptionSignal,
} from '../../../api/types/outgoing/transcription';
import { Icon_cc_showIcon } from '../../../assets/icons';
import { CommonSwitch } from '../../../commonComponents';
import CommonDialogHeader from '../../../commonComponents/CommonDialogComponents/CommonDialogHeader';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import {
  hideTranscriptionSettings,
  saveTranscriptionLanguageToLocalStorage,
  selectIsLiveTranscriptionRunning,
  selectTranscriptionLanguage,
} from '../../../store/slices/transcriptionSlice';

const LanguageSelectLabel = styled(Typography)<{ component?: string; htmlFor?: string }>(({ theme }) => ({
  fontSize: theme.typography.pxToRem(14),
  display: 'block',
  marginBottom: theme.spacing(0.5),
}));

const StyledDialog = styled(Dialog)(() => ({
  '& .MuiDialog-paper': { width: 440, maxWidth: 'calc(100% - 64px)' },
}));

const EnableSubtitlesSwitchContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  alignItems: 'center',
  columnGap: theme.spacing(4),
  rowGap: theme.spacing(0.5),
}));

const LanguageSelectContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const SubtitleSettingsDialog = (props: Omit<DialogProps, 'children'>) => {
  const { t } = useTranslation();
  const transcriptionLanguage = useAppSelector(selectTranscriptionLanguage);
  const isLiveTranscriptionRunning = useAppSelector(selectIsLiveTranscriptionRunning);
  const [shouldEnableLiveTranscription, setShouldEnableLiveTranscription] =
    useState<boolean>(isLiveTranscriptionRunning);
  const [desiredTranscriptionLanguage, setDesiredTranscriptionLanguage] = useState<TranscriptionLanguageKey | ''>(
    transcriptionLanguage || ''
  );
  const dispatch = useAppDispatch();
  const hasLanguageChanged = desiredTranscriptionLanguage && desiredTranscriptionLanguage !== transcriptionLanguage;
  const hasStatusChanged = shouldEnableLiveTranscription !== isLiveTranscriptionRunning;

  const resetDraftState = () => {
    setShouldEnableLiveTranscription(isLiveTranscriptionRunning);
    setDesiredTranscriptionLanguage(transcriptionLanguage || '');
  };

  const closeDialog = () => {
    dispatch(hideTranscriptionSettings());
    props.onClose?.({}, 'escapeKeyDown');
  };

  const onClose = () => {
    resetDraftState();
    closeDialog();
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
      closeDialog();
      return;
    }
    if (shouldEnableLiveTranscription) {
      dispatch(
        sendStartTranscriptionSignal.action({
          language: desiredTranscriptionLanguage.toString(),
        })
      );
    } else {
      dispatch(sendStopTranscriptionSignal.action());
    }
    closeDialog();
  };

  return (
    <StyledDialog {...props} onClose={onClose}>
      <CommonDialogHeader closeMenu={onClose} titleKey="subtitle-settings-dialog-title" icon={<Icon_cc_showIcon />} />
      <Divider aria-hidden={true} sx={{ margin: 0 }} />
      <DialogContent>
        <Stack>
          <EnableSubtitlesSwitchContainer>
            <Typography component="label" htmlFor="enable-subtitles-switch">
              {t('subtitle-settings-enable-subtitles')}
            </Typography>
            <CommonSwitch
              id="enable-subtitles-switch"
              checked={shouldEnableLiveTranscription}
              onChange={() => setShouldEnableLiveTranscription((prev) => !prev)}
            />
            <Typography variant="caption" sx={{ gridColumn: 1 }}>
              {t('subtitle-settings-enable-subtitles-hint')}
            </Typography>
          </EnableSubtitlesSwitchContainer>
          {shouldEnableLiveTranscription && (
            <LanguageSelectContainer>
              <LanguageSelectLabel component="label" htmlFor="input-language-select">
                {t('subtitle-settings-input-language')}
              </LanguageSelectLabel>
              <Select
                renderValue={(lang: TranscriptionLanguageKey | '') => {
                  if (!lang) {
                    return <Typography variant="body2">{t('subtitle-settings-input-language-placeholder')}</Typography>;
                  }
                  return TranscriptionLanguage[lang];
                }}
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
            </LanguageSelectContainer>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button type="button" color="primary" onClick={onClose}>
          {t('global-cancel')}
        </Button>
        <Button
          type="button"
          color="secondary"
          onClick={submit}
          disabled={shouldEnableLiveTranscription && !desiredTranscriptionLanguage}
        >
          {t('global-save')}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default SubtitleSettingsDialog;
