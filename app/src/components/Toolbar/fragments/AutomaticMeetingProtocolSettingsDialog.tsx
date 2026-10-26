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
import { sendStartAutomaticMeetingProtocolSignal } from '../../../api/types/outgoing/transcription';
import { AutomaticMeetingProtocolOnIcon } from '../../../assets/icons';
import { CommonSwitch } from '../../../commonComponents';
import CommonDialogHeader from '../../../commonComponents/CommonDialogComponents/CommonDialogHeader';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { selectFullscreenContainer } from '../../../store/slices/fullscreen/slice';
import {
  saveTranscriptionLanguageToLocalStorage,
  selectIsLiveTranscriptionRunning,
  selectTranscriptionLanguage,
} from '../../../store/slices/transcriptionSlice';
import TranscriptionLanguageSelect from './TranscriptionLanguageSelect';

const StyledDialog = styled(Dialog)(() => ({
  '& .MuiDialog-paper': { width: 480, maxWidth: 'calc(100% - 64px)' },
}));

const PseudonymizationSwitchContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  alignItems: 'center',
  columnGap: theme.spacing(4),
  rowGap: theme.spacing(0.5),
  marginTop: theme.spacing(2),
}));

const AutomaticMeetingProtocolSettingsDialog = (props: Omit<DialogProps, 'children'>) => {
  const { t } = useTranslation();
  const transcriptionLanguage = useAppSelector(selectTranscriptionLanguage);
  const container = useAppSelector(selectFullscreenContainer);
  const isLiveTranscriptionRunning = useAppSelector(selectIsLiveTranscriptionRunning);
  // `null` means the user has not picked a language yet, so the current store language is used.
  const [desiredTranscriptionLanguage, setDesiredTranscriptionLanguage] = useState<TranscriptionLanguageKey | null>(
    null
  );
  const [shouldPseudonymize, setShouldPseudonymize] = useState(false);
  const dispatch = useAppDispatch();
  const selectedLanguage = isLiveTranscriptionRunning
    ? transcriptionLanguage
    : (desiredTranscriptionLanguage ?? transcriptionLanguage);
  const hasLanguageChanged = selectedLanguage && selectedLanguage !== transcriptionLanguage;

  const closeDialog = () => {
    setDesiredTranscriptionLanguage(null);
    setShouldPseudonymize(false);
    props.onClose?.({}, 'escapeKeyDown');
  };

  const submit = () => {
    if (hasLanguageChanged) {
      saveTranscriptionLanguageToLocalStorage(selectedLanguage);
    }
    dispatch(
      sendStartAutomaticMeetingProtocolSignal.action({
        pseudonymous: shouldPseudonymize,
        language: selectedLanguage || undefined,
      })
    );
    closeDialog();
  };

  return (
    <StyledDialog container={container} {...props} onClose={closeDialog}>
      <CommonDialogHeader
        closeMenu={closeDialog}
        titleKey="automatic-meeting-protocol-settings-dialog-title"
        icon={<AutomaticMeetingProtocolOnIcon />}
      />
      <Divider aria-hidden={true} sx={{ margin: 0 }} />
      <DialogContent>
        <Stack>
          <TranscriptionLanguageSelect
            value={selectedLanguage}
            onChange={setDesiredTranscriptionLanguage}
            disabled={isLiveTranscriptionRunning}
            hint={
              isLiveTranscriptionRunning ? t('automatic-meeting-protocol-settings-language-locked-hint') : undefined
            }
          />
          <PseudonymizationSwitchContainer>
            <Typography component="label" htmlFor="pseudonymization-switch">
              {t('automatic-meeting-protocol-settings-pseudonymization')}
            </Typography>
            <CommonSwitch
              id="pseudonymization-switch"
              checked={shouldPseudonymize}
              onChange={() => setShouldPseudonymize((prev) => !prev)}
            />
            <Typography variant="caption" sx={{ gridColumn: 1 }}>
              {t('automatic-meeting-protocol-settings-pseudonymization-hint')}
            </Typography>
          </PseudonymizationSwitchContainer>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button type="button" color="primary" onClick={closeDialog}>
          {t('global-cancel')}
        </Button>
        <Button type="button" color="secondary" onClick={submit} disabled={!selectedLanguage}>
          {t('automatic-meeting-protocol-settings-start-button')}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default AutomaticMeetingProtocolSettingsDialog;
