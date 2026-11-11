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
  Stack,
  styled,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TranscriptionLanguageKey } from '../../../api/types/incoming/transcription';
import {
  changeTranscriptionLanguageSignal,
  sendStartTranscriptionSignal,
  sendStopTranscriptionSignal,
} from '../../../api/types/outgoing/transcription';
import { Icon_cc_showIcon } from '../../../assets/icons';
import { CommonSwitch } from '../../../commonComponents';
import CommonDialogHeader from '../../../commonComponents/CommonDialogComponents/CommonDialogHeader';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { selectFullscreenContainer } from '../../../store/slices/fullscreen/slice';
import {
  hideTranscriptionSettings,
  saveTranscriptionLanguageToLocalStorage,
  selectIsAutomaticMeetingProtocolRunning,
  selectIsLiveTranscriptionRunning,
  selectTranscriptionLanguage,
} from '../../../store/slices/transcriptionSlice';
import TranscriptionLanguageSelect from './TranscriptionLanguageSelect';

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
  const container = useAppSelector(selectFullscreenContainer);
  const isLiveTranscriptionRunning = useAppSelector(selectIsLiveTranscriptionRunning);
  const isAutomaticMeetingProtocolRunning = useAppSelector(selectIsAutomaticMeetingProtocolRunning);
  // Stores the switch state made by user before user submitted
  // `null` means, the user has not made the choice yet
  const [isLiveTranscriptionDesiredByUser, setIsLiveTranscriptionDesiredByUser] = useState<boolean | null>(null);
  // `null` means, the user has not picked language yet
  const [desiredTranscriptionLanguage, setDesiredTranscriptionLanguage] = useState<TranscriptionLanguageKey | null>(
    null
  );
  const dispatch = useAppDispatch();
  // If user hasn't made choice yet, show the real state of the service
  const shouldEnableLiveTranscription = isLiveTranscriptionDesiredByUser ?? isLiveTranscriptionRunning;
  const selectedLanguage = isAutomaticMeetingProtocolRunning
    ? transcriptionLanguage
    : (desiredTranscriptionLanguage ?? transcriptionLanguage);
  const hasLanguageChanged = selectedLanguage && selectedLanguage !== transcriptionLanguage;
  const hasStatusChanged = shouldEnableLiveTranscription !== isLiveTranscriptionRunning;

  const closeDialog = () => {
    // The dialog keeps always mounted in the menu
    // therefore we need to reset user choice on close
    setIsLiveTranscriptionDesiredByUser(null);
    setDesiredTranscriptionLanguage(null);
    dispatch(hideTranscriptionSettings());
    props.onClose?.({}, 'escapeKeyDown');
  };

  const submit = () => {
    if (hasLanguageChanged) {
      saveTranscriptionLanguageToLocalStorage(selectedLanguage);
      // check if the desired status is the same as the current status, if so, just close the dialog
      if (!hasStatusChanged) {
        // check if the language has changed, if so, send a change language signal
        dispatch(changeTranscriptionLanguageSignal.action({ language: selectedLanguage }));
      }
    }
    if (!hasStatusChanged) {
      closeDialog();
      return;
    }
    if (shouldEnableLiveTranscription) {
      dispatch(
        sendStartTranscriptionSignal.action({
          language: selectedLanguage.toString(),
        })
      );
    } else {
      dispatch(sendStopTranscriptionSignal.action());
    }
    closeDialog();
  };

  return (
    <StyledDialog container={container} {...props} onClose={closeDialog}>
      <CommonDialogHeader
        closeMenu={closeDialog}
        titleKey="subtitle-settings-dialog-title"
        icon={<Icon_cc_showIcon />}
      />
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
              onChange={() => setIsLiveTranscriptionDesiredByUser(!shouldEnableLiveTranscription)}
            />
            <Typography variant="caption" sx={{ gridColumn: 1 }}>
              {t('subtitle-settings-enable-subtitles-hint')}
            </Typography>
          </EnableSubtitlesSwitchContainer>
          {shouldEnableLiveTranscription && (
            <LanguageSelectContainer>
              <TranscriptionLanguageSelect
                value={selectedLanguage}
                onChange={setDesiredTranscriptionLanguage}
                disabled={isAutomaticMeetingProtocolRunning}
                hint={isAutomaticMeetingProtocolRunning ? t('subtitle-settings-language-locked-hint') : undefined}
              />
            </LanguageSelectContainer>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button type="button" color="primary" onClick={closeDialog}>
          {t('global-cancel')}
        </Button>
        <Button
          type="button"
          color="secondary"
          onClick={submit}
          disabled={shouldEnableLiveTranscription && !selectedLanguage}
        >
          {t('global-save')}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default SubtitleSettingsDialog;
