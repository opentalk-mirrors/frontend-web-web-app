// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, styled, Switch, Typography, Tooltip, Grid, Stack } from '@mui/material';
import { FormikValues, Formik } from 'formik';
import i18next from 'i18next';
import { isEmpty } from 'lodash';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import { start } from '../../../api/types/outgoing/poll';
import { BackIcon } from '../../../assets/icons';
import { CommonFormItem, DurationField, notifications } from '../../../commonComponents';
import { CommonTextField } from '../../../commonComponents';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { PollFormValues, savePollFormValues } from '../../../store/slices/pollSlice';
import { selectCurrentRoomMode } from '../../../store/slices/roomSlice';
import { RoomMode } from '../../../types';
import { formikDurationFieldProps, formikSwitchProps, formikProps } from '../../../utils/formikUtils';
import { Seconds } from '../../../utils/tsUtils';
import { DurationFieldWrapper } from '../../DurationFieldWrapper';
import SaveAsTemplateButton from '../../SaveAsTemplateButton';
import AnswersFormElement from './AnswersFormElement';

interface PollFormProps {
  onClose: () => void;
  initialValues?: PollFormValues;
}

const Form = styled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  overflow: 'auto',
  gap: theme.spacing(1), // Spacing between form fields and buttons
}));

const TOPIC_MIN_LENGTH = 3;
const TOPIC_MAX_LENGTH = 100;
const MAX_DURATION_IN_MINUTES = 60;
const CHOICE_MIN_LENGTH = 2;
const CHOICE_MAX_LENGTH = 64;

const defaultInitialValues: PollFormValues = {
  choices: Array(CHOICE_MIN_LENGTH).fill(''),
  topic: '',
  duration: 1,
  live: false,
  multipleChoice: false,
};

const validationSchema = yup.object({
  topic: yup
    .string()
    .trim()
    .min(TOPIC_MIN_LENGTH, i18next.t('poll-form-input-error-min', { min: TOPIC_MIN_LENGTH }))
    .max(TOPIC_MAX_LENGTH, i18next.t('poll-form-input-error-max', { max: TOPIC_MAX_LENGTH }))
    .required(i18next.t('legal-vote-input-topic-required')),
  duration: yup.number().positive().nullable().typeError(i18next.t('poll-form-input-error-number')),
  choices: yup
    .array()
    .of(yup.string().trim().required(i18next.t('poll-form-input-error-choice')))
    .min(CHOICE_MIN_LENGTH, i18next.t('poll-form-input-error-choices', { min: CHOICE_MIN_LENGTH }))
    .required(i18next.t('poll-form-input-error-choices', { min: CHOICE_MIN_LENGTH })),
  live: yup.boolean().optional(),
  multipleChoice: yup.boolean().optional(),
});

const CreatePollForm = ({ initialValues = defaultInitialValues, onClose }: PollFormProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isEditing = initialValues?.id !== undefined;
  const isCoffeeBreakActive = useAppSelector(selectCurrentRoomMode) === RoomMode.CoffeeBreak;

  const isSaveAsTemplateInvalid = (values: PollFormValues) => isEmpty(values.topic);

  const saveFormValues = useCallback(
    (values: PollFormValues) => {
      if (isSaveAsTemplateInvalid(values)) {
        notifications.error(t('poll-save-form-error'));
      } else {
        dispatch(savePollFormValues(values));
        notifications.success(t('poll-save-form-success'));
      }
    },
    [dispatch, t]
  );

  const onSubmit = (values: FormikValues) => {
    onClose();
    dispatch(
      start.action({
        topic: values.topic,
        duration: (values.duration * 60) as Seconds,
        live: values.live,
        multipleChoice: values.multipleChoice,
        choices: values.choices,
      })
    );
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      validateOnBlur={false}
      validateOnChange={true}
      validateOnMount={true}
      validationSchema={validationSchema}
    >
      {(formik) => (
        <Stack
          spacing={1}
          sx={{
            flex: 1,
            overflow: 'hidden',
          }}
        >
          <Form data-testid="create-poll-form" onSubmit={formik.handleSubmit}>
            <Typography>{isEditing ? t('poll-header-title-update') : t('poll-header-title-create')}</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <DurationFieldWrapper paddingTop={1}>
                  <DurationField
                    {...formikDurationFieldProps('duration', formik)}
                    durationOptions={[1, 2, 5, 'custom']}
                    min={1}
                    max={MAX_DURATION_IN_MINUTES}
                  />
                </DurationFieldWrapper>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <CommonFormItem
                  {...formikSwitchProps('live', formik)}
                  control={
                    <Tooltip title={`${t('poll-form-switch-live-tooltip')}`}>
                      <Switch color="primary" />
                    </Tooltip>
                  }
                  label={t('poll-form-switch-live')}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <CommonFormItem
                  {...formikSwitchProps('multipleChoice', formik)}
                  control={
                    <Tooltip title={`${t('poll-form-switch-multiple-choice-tooltip')}`}>
                      <Switch color="primary" />
                    </Tooltip>
                  }
                  label={t('poll-form-switch-multiple-choice')}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <CommonTextField
                  {...formikProps('topic', formik)}
                  label={t('poll-topic-label')}
                  placeholder={t('poll-topic-placeholder')}
                  fullWidth
                  minRows={4}
                  maxRows={6}
                  multiline
                  maxCharacters={TOPIC_MAX_LENGTH}
                  showLimitAt={0}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <AnswersFormElement name="choices" answersRange={{ min: CHOICE_MIN_LENGTH, max: CHOICE_MAX_LENGTH }} />
              </Grid>
            </Grid>
            <Stack direction="column" spacing={2} mt="auto">
              <SaveAsTemplateButton
                onClick={() => saveFormValues(formik.values)}
                disabled={isSaveAsTemplateInvalid(formik.values)}
              />
              <Stack direction="row" spacing={1} mt="auto">
                <Button type="button" onClick={onClose} startIcon={<BackIcon />} fullWidth color="primary">
                  {t('poll-button-back')}
                </Button>
                <Button disabled={isCoffeeBreakActive || !formik.isValid} type="submit" fullWidth color="secondary">
                  {t('poll-form-button-submit')}
                </Button>
              </Stack>
            </Stack>
          </Form>
        </Stack>
      )}
    </Formik>
  );
};

export default CreatePollForm;
