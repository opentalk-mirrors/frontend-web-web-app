// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, Chip as MuiChip, Grid, styled } from '@mui/material';
import { FieldArray, Field, FieldProps, useFormikContext } from 'formik';
import { get, isEmpty } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AddIcon } from '../../../assets/icons';
import { CommonTextField } from '../../../commonComponents';

interface IAnswersFormElementProps {
  name: string;
}

const Chip = styled(MuiChip)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  height: 'unset',
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
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
  '&.Mui-disabled': {
    color: theme.palette.text.disabled,
  },
}));

const AnswersFormElement = ({ name }: IAnswersFormElementProps) => {
  const [editingIndex, setEditingIndex] = useState<number>();
  const inputRef = useRef<HTMLInputElement>(null);
  const { values, errors } = useFormikContext();
  const { t } = useTranslation();

  const choices = get(values, name, []);
  const answerErrors = get(errors, name, []);

  useEffect(() => {
    choices.forEach((item: string, index: number) => {
      if (isEmpty(item)) {
        setEditingIndex(index);
      }
    });
  }, [name, choices]);

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
                      defaultValue={value}
                      error={Array.isArray(answerErrors) && Boolean(answerErrors[index])}
                      helperText={Array.isArray(answerErrors) && answerErrors[index]}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setEditingIndex(undefined);
                          onBlur && onBlur(e);
                          onChange && onChange(e);
                          if (isEmpty(inputRef.current?.value)) {
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
                        if (isEmpty(e.target.value)) {
                          arrayHelpers.remove(index);
                        }
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
                  label={choices[index]}
                  onClick={() => setEditingIndex(index)}
                  onDelete={() => arrayHelpers.remove(index)}
                />
              )}
            </Grid>
          ))}
          <Grid>
            <StyledAddButton
              size="small"
              type="button"
              variant="text"
              onClick={() => arrayHelpers.push('')}
              startIcon={<Add />}
              disabled={editingIndex !== undefined}
              color="secondary"
            >
              {t('poll-input-choices')}
            </StyledAddButton>
          </Grid>
        </Grid>
      )}
    />
  );
};

export default AnswersFormElement;
