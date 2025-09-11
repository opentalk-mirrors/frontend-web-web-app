// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, styled, Switch, Typography, Tooltip, Box } from '@mui/material';
import { FormikValues, Formik } from 'formik';
import i18next from 'i18next';
import { isEmpty } from 'lodash';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import { start } from '../../../api/types/outgoing/poll';
import { BackIcon } from '../../../assets/icons';
import { CommonFormItem, DurationField, ErrorFormMessage, notifications } from '../../../commonComponents';
import { CommonTextField } from '../../../commonComponents';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { selectParticipantsTotal } from '../../../store/slices/participantsSlice';
import { PollFormValues, savePollFormValues } from '../../../store/slices/pollSlice';
import { selectCurrentRoomMode } from '../../../store/slices/roomSlice';
import { RoomMode } from '../../../types';
import { formikDurationFieldProps, formikSwitchProps, formikProps } from '../../../utils/formikUtils';
import { Seconds } from '../../../utils/tsUtils';
import { DurationFieldWrapper } from '../../DurationFieldWrapper';
import AnswersFormElement from './AnswersFormElement';

interface ICreatePollForm {
  onClose: () => void;
  initialValues?: PollFormValues;
}

const defaultInitialValues: PollFormValues = {
  choices: [],
  topic: '',
  duration: 1,
  live: false,
  multipleChoice: false,
};

const Form = styled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  overflow: 'hidden',
  width: '100%',
  gap: theme.spacing(1), // Spacing between form fields and buttons
}));

const TOPIC_MIN_LENGTH = 3;
const TOPIC_MAX_LENGTH = 500;

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
    .min(2, i18next.t('poll-form-input-error-choices'))
    .required(i18next.t('poll-form-input-error-choices')),
  live: yup.boolean().optional(),
  multipleChoice: yup.boolean().optional(),
});

const CreatePollForm = ({ initialValues = defaultInitialValues, onClose }: ICreatePollForm) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const totalParticipants = useAppSelector(selectParticipantsTotal);
  const isEditing = initialValues?.id !== undefined;
  const isCoffeeBreakActive = useAppSelector(selectCurrentRoomMode) === RoomMode.CoffeeBreak;
  const saveFormValues = useCallback(
    (values: PollFormValues) => {
      if (isEmpty(values.topic)) {
        notifications.error(t('poll-save-form-error'));
      } else {
        onClose();
        dispatch(savePollFormValues(values));
        notifications.success(t('poll-save-form-success'));
      }
    },
    [dispatch, t]
  );

  const onSubmit = (values: FormikValues) => {
    if (totalParticipants < 2) {
      return notifications.warning(t('poll-save-form-warning'));
    }
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
      validateOnChange={false}
      validationSchema={validationSchema}
    >
      {(formik) => (
        <Form onSubmit={formik.handleSubmit}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                marginBottom: 1,
                paddingLeft: 0.5,
                paddingTop: 0.5,
              }}
            >
              <Button variant="text" onClick={onClose} startIcon={<BackIcon />} color="secondary">
                {t('poll-button-back')}
              </Button>
            </Box>
            <Typography variant="h2" component="h4">
              {isEditing ? t('poll-header-title-update') : t('poll-header-title-create')}
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <DurationFieldWrapper paddingTop={1} paddingBottom={1} paddingRight={1}>
                <DurationField
                  {...formikDurationFieldProps('duration', formik)}
                  durationOptions={[1, 2, 5, 'custom']}
                  min={1}
                />
              </DurationFieldWrapper>
              <Box
                sx={{
                  marginBottom: 1,
                  paddingRight: 1,
                }}
              >
                <CommonFormItem
                  {...formikSwitchProps('live', formik)}
                  control={
                    <Tooltip title={`${t('poll-form-switch-live-tooltip')}`}>
                      <Switch color="primary" />
                    </Tooltip>
                  }
                  label={t('poll-form-switch-live')}
                />
              </Box>
              <Box
                sx={{
                  marginBottom: 1,
                  paddingRight: 1,
                }}
              >
                <CommonFormItem
                  {...formikSwitchProps('multipleChoice', formik)}
                  control={
                    <Tooltip title={`${t('poll-form-switch-multiple-choice-tooltip')}`}>
                      <Switch color="primary" />
                    </Tooltip>
                  }
                  label={t('poll-form-switch-multiple-choice')}
                />
              </Box>
              <Box
                sx={{
                  marginBottom: 1,
                  paddingRight: 1,
                }}
              >
                <CommonTextField
                  {...formikProps('topic', formik)}
                  label={t('poll-topic-label')}
                  placeholder={t('poll-topic-placeholder')}
                  fullWidth
                  minRows={4}
                  maxRows={6}
                  multiline
                />
              </Box>
              <Box
                sx={{
                  paddingLeft: 1,
                  paddingRight: 1,
                }}
              >
                <AnswersFormElement name="choices" />
              </Box>
              <Box
                sx={{
                  marginBottom: 1,
                }}
              >
                {/* General choices error message */}
                {typeof formik.errors.choices === 'string' && <ErrorFormMessage helperText={formik.errors.choices} />}
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 2,
              padding: 1,
            }}
          >
            <Button type="button" onClick={() => saveFormValues(formik.values)} fullWidth color="secondary">
              {t('poll-form-button-save')}
            </Button>
            <Button disabled={isCoffeeBreakActive} type="submit" fullWidth color="secondary">
              {t('poll-form-button-submit')}
            </Button>
          </Box>
        </Form>
      )}
    </Formik>
  );
};

export default CreatePollForm;
