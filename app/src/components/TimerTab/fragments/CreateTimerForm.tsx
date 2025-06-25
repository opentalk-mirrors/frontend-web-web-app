// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, Stack, styled, Switch } from '@mui/material';
import { FormikValues, useFormik } from 'formik';
import { TFunction } from 'i18next';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import { startTimer } from '../../../api/types/outgoing/timer';
import { DurationField, CommonTextField, CommonFormItem, DurationValueOptions } from '../../../commonComponents';
import { useAppDispatch } from '../../../hooks';
import { TimerKind, TimerStyle } from '../../../types';
import { formikDurationFieldProps, formikProps, formikSwitchProps } from '../../../utils/formikUtils';
import { DurationFieldWrapper } from '../../DurationFieldWrapper';

const Container = styled(Stack)({
  display: 'flex',
  flex: 1,
  justifyContent: 'space-between',
});

const SubmitButton = styled(Button)({
  '&.MuiButton-root': {
    flexGrow: 0,
  },
});

interface Texts {
  header: string;
  button: string;
}

interface TimerState {
  texts: Texts;
  durationOptions: Array<DurationValueOptions>;
  defaultValue: number;
  min: number;
}

const getTimerState = (timerStyle: TimerStyle, t: TFunction<'translation', undefined>): TimerState => {
  if (timerStyle === TimerStyle.CoffeeBreak) {
    return {
      texts: {
        header: t('coffee-break-tab-title'),
        button: t('coffee-break-form-button-submit'),
      },
      durationOptions: [5, 10, 15, 30, 'custom'],
      defaultValue: 5,
      min: 1,
    };
  } else {
    return {
      texts: {
        header: t('timer-tab-title'),
        button: t('timer-form-button-submit'),
      },
      durationOptions: [null, 1, 2, 5, 'custom'],
      defaultValue: 1,
      min: 1,
    };
  }
};

const CreateTimerForm = ({ timerStyle }: { timerStyle: TimerStyle }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const { texts, durationOptions, defaultValue, min } = useMemo(() => getTimerState(timerStyle, t), [timerStyle, t]);

  const getTimerForStart = useCallback(
    (values: FormikValues) => {
      return {
        kind: !values.duration ? TimerKind.Stopwatch : TimerKind.Countdown,
        style: timerStyle,
      };
    },
    [timerStyle]
  );

  const validationSchema = yup.object({
    duration: yup.number().nullable(),
  });

  const formik = useFormik({
    initialValues: { duration: defaultValue, title: undefined, enableReadyCheck: true },
    validationSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: (values: FormikValues) => {
      dispatch(
        startTimer.action({
          title: values.title,
          enableReadyCheck: values.enableReadyCheck,
          duration: values.duration ? values.duration * 60 : values.duration,
          ...getTimerForStart(values),
        })
      );
    },
  });

  const handleSubmit = () => {
    formik.handleSubmit();
  };

  return (
    <Container>
      <Stack
        spacing={2}
        sx={{
          mb: 2,
        }}
      >
        <DurationFieldWrapper>
          <DurationField
            {...formikDurationFieldProps('duration', formik, defaultValue)}
            durationOptions={durationOptions}
            ButtonProps={{
              size: 'small',
            }}
            min={min}
          />
        </DurationFieldWrapper>

        {timerStyle === TimerStyle.Normal && (
          <>
            <CommonTextField
              {...formikProps('title', formik)}
              placeholder={t('timer-title-placeholder')}
              fullWidth
              label={t('global-title')}
            />
            <Stack spacing={1}>
              <CommonFormItem
                {...formikSwitchProps('enableReadyCheck', formik)}
                control={<Switch color="primary" />}
                label={t('timer-form-ready-to-continue')}
              />
            </Stack>
          </>
        )}
      </Stack>
      <SubmitButton onClick={handleSubmit}>{texts.button}</SubmitButton>
    </Container>
  );
};

export default CreateTimerForm;
