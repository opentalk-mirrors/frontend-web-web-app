// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { MenuItem, Select, styled, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { TranscriptionLanguage, TranscriptionLanguageKey } from '../../../api/types/incoming/transcription';
import { useAppSelector } from '../../../hooks';
import { selectFullscreenContainer } from '../../../store/slices/fullscreen/slice';

const LanguageSelectLabel = styled(Typography)<{ component?: string; htmlFor?: string }>(({ theme }) => ({
  fontSize: theme.typography.pxToRem(14),
  display: 'block',
  marginBottom: theme.spacing(0.5),
}));

const LanguageSelectHint = styled(Typography)(({ theme }) => ({
  display: 'block',
  marginTop: theme.spacing(0.5),
}));

const SELECT_ID = 'input-language-select';
const HINT_ID = 'input-language-select-hint';

type TranscriptionLanguageSelectProps = {
  value: TranscriptionLanguageKey | '';
  onChange: (language: TranscriptionLanguageKey) => void;
  disabled?: boolean;
  hint?: string;
};

const TranscriptionLanguageSelect = ({ value, onChange, disabled, hint }: TranscriptionLanguageSelectProps) => {
  const { t } = useTranslation();
  const container = useAppSelector(selectFullscreenContainer);

  return (
    <>
      <LanguageSelectLabel component="label" htmlFor={SELECT_ID}>
        {t('transcription-language-select-label')}
      </LanguageSelectLabel>
      <Select
        renderValue={(lang: TranscriptionLanguageKey | '') => {
          if (!lang) {
            return <Typography variant="body2">{t('transcription-language-select-placeholder')}</Typography>;
          }
          return TranscriptionLanguage[lang];
        }}
        displayEmpty
        MenuProps={{ container }}
        disabled={disabled}
        inputProps={{ id: SELECT_ID }}
        SelectDisplayProps={hint ? { 'aria-describedby': HINT_ID } : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value as TranscriptionLanguageKey)}
      >
        {Object.keys(TranscriptionLanguage).map((key) => (
          <MenuItem key={key} value={key.toString()}>
            {TranscriptionLanguage[key as TranscriptionLanguageKey]}
          </MenuItem>
        ))}
      </Select>
      {hint && (
        <LanguageSelectHint variant="caption" id={HINT_ID}>
          {hint}
        </LanguageSelectHint>
      )}
    </>
  );
};

export default TranscriptionLanguageSelect;
