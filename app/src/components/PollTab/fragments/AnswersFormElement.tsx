// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, Chip as MuiChip, Grid, styled, Typography, FormHelperText } from '@mui/material';
import { FieldArray, Field, FieldProps, useFormikContext } from 'formik';
import { get, isEmpty } from 'lodash';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AddIcon } from '../../../assets/icons';
import { CommonTextField } from '../../../commonComponents';
import i18n from '../../../i18n';

interface IAnswersFormElementProps {
  name: string;
  answersRange: {
    min: number;
    max: number;
  };
}

//Backend says the limit is 100 but we get an error at 100 characters. So this number is still WIP
const MAX_ANSWER_LENGTH = 70;

const Chip = styled(MuiChip)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  height: 'unset',
  minHeight: theme.typography.pxToRem(32),
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  borderRadius: theme.borderRadius.small,
  '&.Mui-focusVisible': {
    outlineOffset: -2,
  },
  '& .MuiChip-label': {
    textOverflow: 'unset',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    color: theme.palette.text.primary,
  },
  '& .MuiSvgIcon-root': {
    fontSize: '1rem',
  },
}));

const Add = styled(AddIcon)({
  width: '0.6em',
  height: '0.6em',
});

const StyledCommonTextField = styled(CommonTextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root.Mui-focused': {
    backgroundColor: theme.palette.background.highlight.primary,
    color: theme.palette.background.highlight.contrastText,
  },
}));

const StyledAddButton = styled(Button)(({ theme }) => ({
  paddingLeft: 0,
  '&.Mui-disabled': {
    color: theme.palette.text.disabled,
  },
  '& .MuiButton-startIcon': {
    marginLeft: 0,
  },
}));

const ChipLabelTypography = styled(Typography)(({ theme }) => ({
  paddingRight: theme.spacing(2),
  fontSize: theme.typography.pxToRem(13),
  fontWeight: theme.typography.fontWeightRegular,
  '& .MuiFormLabel-asterisk': {
    color: theme.palette.text.error,
  },
}));

const AnswersFormElement = ({ name, answersRange: { min: minAnswers, max: maxAnswers } }: IAnswersFormElementProps) => {
  const [editingIndex, setEditingIndex] = useState<number>();
  const inputRef = useRef<HTMLInputElement>(null);
  const { values, errors, touched } = useFormikContext();
  const { t } = useTranslation();

  const choices = get(values, name, []);
  const answerErrors = get(errors, name, []);

  const isTouched = (name: string) => {
    const error = get(errors, name);
    const touchedField = get(touched, name);

    return Boolean(error) && Boolean(touchedField);
  };

  const showUniqueError = () => get(errors, name)?.includes(i18n.t('poll-form-input-error-choice-unique'));

  return (
    <FieldArray
      name={name}
      render={(arrayHelpers) => (
        <Grid container spacing={1}>
          {choices.map((answer: string, index: number) => (
            <Grid size={{ xs: 12 }} key={index}>
              {editingIndex === index ? (
                <Field
                  name={`${name}.${index}`}
                  component={({ field: { value, onBlur, onChange, name } }: FieldProps) => (
                    <StyledCommonTextField
                      inputRef={inputRef}
                      name={name}
                      size="small"
                      fullWidth
                      error={isTouched(name) && Array.isArray(answerErrors) && Boolean(answerErrors[index])}
                      helperText={isTouched(name) && Array.isArray(answerErrors) && answerErrors[index]}
                      maxCharacters={MAX_ANSWER_LENGTH}
                      showLimitAt={0}
                      value={value}
                      onChange={onChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setEditingIndex(undefined);
                          onBlur && onBlur(e);
                          onChange && onChange(e);
                          if (isEmpty(inputRef.current?.value) && index >= minAnswers) {
                            arrayHelpers.remove(index);
                          }
                        }
                        if (e.key === 'Escape') {
                          (e.target as HTMLInputElement)?.blur();
                        }
                      }}
                      onBlur={(e) => {
                        setEditingIndex(undefined);
                        onBlur && onBlur(e);
                        onChange && onChange(e);
                      }}
                      slotProps={{
                        input: {
                          autoFocus: true,
                        },
                      }}
                    />
                  )}
                />
              ) : (
                <Chip
                  label={
                    answer || (
                      <ChipLabelTypography>
                        {t('poll-input-option', { number: index + 1 })}
                        {index < minAnswers && (
                          <span aria-hidden="true" className="MuiFormLabel-asterisk MuiInputLabel-asterisk">
                            &nbsp;*
                          </span>
                        )}
                      </ChipLabelTypography>
                    )
                  }
                  onClick={() => setEditingIndex(index)}
                  onDelete={choices.length > minAnswers ? () => arrayHelpers.remove(index) : undefined}
                />
              )}
            </Grid>
          ))}
          {showUniqueError() && (
            <Grid>
              <FormHelperText error>{t('poll-form-input-error-choice-unique')}</FormHelperText>
            </Grid>
          )}
          <Grid>
            <StyledAddButton
              size="small"
              type="button"
              variant="text"
              onClick={() => {
                arrayHelpers.push('');
                setEditingIndex(choices.length);
              }}
              startIcon={<Add />}
              color="secondary"
              disabled={choices.length >= maxAnswers}
            >
              {choices.length >= maxAnswers
                ? t('poll-input-option-max', { max: maxAnswers })
                : t('poll-input-option-button')}
            </StyledAddButton>
          </Grid>
        </Grid>
      )}
    />
  );
};

export default AnswersFormElement;
