// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled, Switch, Button, Grid, Typography, Box, Tooltip, Stack, Select, MenuItem } from '@mui/material';
import { Formik, Form as FormikForm } from 'formik';
import { FormikProps, FormikValues } from 'formik/dist/types';
import { isEmpty } from 'lodash';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';

import { start } from '../../../api/types/outgoing/legalVote';
import { BackIcon } from '../../../assets/icons';
import { DurationField, CommonTextField, notifications } from '../../../commonComponents';
import { CommonFormItem } from '../../../commonComponents';
import { savedLegalVoteForm, selectLegalVoteId } from '../../../store/slices/legalVoteSlice';
import { LegalVoteFormValues, SavedLegalVoteForm } from '../../../types';
import {
  formikDurationFieldProps,
  formikSwitchProps,
  formikProps,
  formikSelectProps,
} from '../../../utils/formikUtils';
import { getCurrentTimezone } from '../../../utils/timeFormatUtils';
import ParticipantSelector, { AllowedParticipant } from './ParticipantSelector';

interface ICreateLegalVoteFormProps {
  initialValues?: SavedLegalVoteForm;
  onClose: () => void;
  isCoffeeBreakActive: boolean;
}

const defaultInitialValues = {
  duration: 1,
  enableAbstain: true,
  autoClose: false,
  name: '',
  topic: '',
  allowedParticipants: [],
  subtitle: '',
  createPdf: true,
  kind: 'roll_call',
} as LegalVoteFormValues;

const Form = styled(FormikForm)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'auto',
  width: '100%',
});

const legalVoteOptions = ['roll_call', 'live_roll_call', 'pseudonymous'];

const CreateLegalVoteForm = ({
  initialValues = defaultInitialValues,
  onClose,
  isCoffeeBreakActive,
}: ICreateLegalVoteFormProps) => {
  const { t } = useTranslation();
  const legalVoteId = useRef(useSelector(selectLegalVoteId));
  const dispatch = useDispatch();

  const [currentStep, setCurrentStep] = useState(0);

  const validationSchema = yup.object({
    name: yup
      .string()
      .trim()
      .max(150, t('legal-vote-form-input-error-max', { maxCharacters: 150 }))
      .required(t('legal-vote-input-title-required')),
    subtitle: yup
      .string()
      .trim()
      .max(255, t('legal-vote-form-input-error-max', { maxCharacters: 255 })),
    topic: yup
      .string()
      .trim()
      .max(500, t('legal-vote-form-input-error-max', { maxCharacters: 500 })),
    duration: yup.number().min(0).nullable().typeError(t('legal-vote-form-input-error-number')),
    createPdf: yup.bool(),
    kind: yup.string().oneOf(legalVoteOptions),
  });

  const saveFormValues = useCallback(
    (legalVoteFormValues: LegalVoteFormValues) => {
      if (isEmpty(legalVoteFormValues.topic) || isEmpty(legalVoteFormValues.name)) {
        notifications.error(t('legal-vote-save-form-error'));
      } else {
        dispatch(
          savedLegalVoteForm({
            id: legalVoteId.current,
            ...legalVoteFormValues,
          })
        );
        notifications.success(t('legal-vote-save-form-success'));
      }
    },
    [dispatch, t]
  );

  const participantValidationSchema = useMemo(() => {
    return yup.object({
      allowedParticipants: yup
        .array()
        .min(2, t('legal-vote-input-assignments-required'))
        .required(t('legal-vote-input-assignments-required')),
    });
  }, [t]);

  const getCurrentValidationSchema = () => {
    return currentStep === 0 ? validationSchema : participantValidationSchema;
  };

  const renderStep = (formik: FormikProps<LegalVoteFormValues>) => {
    if (currentStep === 0) {
      return (
        <Grid container spacing={1}>
          <Grid size={{ xs: 12 }}>
            <Stack
              direction="row"
              sx={{
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 1,
                paddingRight: 1,
              }}
            >
              <Typography variant="body2">{t('legal-vote-form-duration')}</Typography>
              <DurationField
                {...formikDurationFieldProps('duration', formik)}
                durationOptions={[null, 1, 2, 5, 'custom']}
                setFieldValue={formik.setFieldValue}
                ButtonProps={{
                  size: 'small',
                }}
              />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CommonFormItem
              {...formikSwitchProps('enableAbstain', formik)}
              control={<Switch color="primary" />}
              label={t('legal-vote-form-allow-abstain')}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CommonFormItem
              {...formikSwitchProps('autoClose', formik)}
              control={
                <Tooltip title={`${t('legal-vote-form-auto-stop-tooltip')}`}>
                  <Switch color="primary" />
                </Tooltip>
              }
              label={t('legal-vote-form-auto-stop')}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Select {...formikSelectProps('kind', formik)} defaultValue={formik.initialValues['kind']} id="vote-kind">
              {legalVoteOptions.map((kind) => (
                <MenuItem key={kind} value={kind}>
                  {t(`legal-vote-${kind}`)}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CommonTextField
              {...formikProps('name', formik)}
              label={t('legal-vote-title-label')}
              placeholder={t('legal-vote-title-placeholder')}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CommonTextField
              {...formikProps('subtitle', formik)}
              label={t('legal-vote-subtitle-label')}
              placeholder={t('legal-vote-subtitle-placeholder')}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CommonTextField
              {...formikProps('topic', formik)}
              minRows={4}
              maxRows={6}
              multiline
              label={t('legal-vote-topic-label')}
              placeholder={t('legal-vote-topic-placeholder')}
              fullWidth
            />
          </Grid>
        </Grid>
      );
    }

    return <ParticipantSelector name="allowedParticipants" />;
  };

  const onSubmit = (values: FormikValues) => {
    const allowedParticipants = values.allowedParticipants as AllowedParticipant[];
    dispatch(
      start.action({
        name: values.name,
        subtitle: values.subtitle || undefined,
        topic: values.topic || undefined,
        enableAbstain: values.enableAbstain,
        autoClose: values.autoClose,
        duration: values.duration ? values.duration * 60 : values.duration,
        allowedParticipants: Array.isArray(allowedParticipants)
          ? allowedParticipants.map((allowedParticipant) => allowedParticipant.id)
          : [],
        createPdf: values.createPdf,
        kind: values.kind,
        timezone: getCurrentTimezone() || undefined,
      })
    );
    onClose();
  };

  const handleNext = async (formik: FormikProps<LegalVoteFormValues>) => {
    const errors = await formik.validateForm();
    if (Object.keys(errors).length === 0) {
      if (currentStep === 0) {
        setCurrentStep(1);
      } else {
        formik.submitForm();
      }
    } else {
      const touchedFields = Object.keys(errors).reduce<Record<string, boolean>>((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});
      formik.setTouched(touchedFields);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onClose();
    }
  };

  const renderButtons = (formik: FormikProps<LegalVoteFormValues>) => {
    const isLastStep = currentStep === 1;

    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 2,
          padding: 1,
        }}
      >
        {!isLastStep && (
          <Button type="button" onClick={() => saveFormValues(formik.values)} fullWidth color="secondary">
            {t('legal-vote-form-button-save')}
          </Button>
        )}

        <Button
          type="button"
          disabled={isCoffeeBreakActive}
          onClick={() => handleNext(formik)}
          fullWidth
          color="secondary"
        >
          {isLastStep ? t('poll-participant-list-button-start') : t('legal-vote-form-button-continue')}
        </Button>
      </Box>
    );
  };

  return (
    <Formik
      enableReinitialize={true}
      initialValues={initialValues}
      validationSchema={getCurrentValidationSchema()}
      onSubmit={onSubmit}
      validateOnBlur={false}
      validateOnChange={false}
    >
      {(formik) => (
        <Stack
          spacing={1}
          sx={{
            flex: 1,
            overflow: 'hidden',
          }}
        >
          <Stack
            spacing={1}
            sx={{
              flex: 1,
              overflow: 'hidden',
            }}
          >
            <Stack
              spacing={1}
              sx={{
                alignItems: 'flex-start',
                paddingLeft: 0.5,
                paddingTop: 0.5,
              }}
            >
              <Button variant="text" onClick={handlePrev} startIcon={<BackIcon />} size="small" color="secondary">
                {t('legal-vote-button-back')}
              </Button>
            </Stack>

            <Form>
              {' '}
              <Typography variant="h2" component="h4">
                {initialValues?.id !== undefined
                  ? t('legal-vote-header-title-update')
                  : t('legal-vote-header-title-create')}
              </Typography>
              {renderStep(formik)}
            </Form>
          </Stack>
          {renderButtons(formik)}
        </Stack>
      )}
    </Formik>
  );
};

export default CreateLegalVoteForm;
