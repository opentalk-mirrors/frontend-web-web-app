// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { styled, Button, Typography, Stack } from '@mui/material';
import { Formik, Form as FormikForm } from 'formik';
import { FormikProps, FormikValues } from 'formik/dist/types';
import { isEmpty } from 'lodash';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';

import { start } from '../../../api/types/outgoing/legalVote';
import { BackIcon } from '../../../assets/icons';
import { notifications } from '../../../commonComponents';
import { savedLegalVoteForm, selectLegalVoteId } from '../../../store/slices/legalVoteSlice';
import { LegalVoteFormValues, LegalVoteKind, SavedLegalVoteForm } from '../../../types';
import { getCurrentTimezone } from '../../../utils/timeFormatUtils';
import SaveAsTemplateButton from '../../SaveAsTemplateButton';
import LegalVoteSetupForm from './LegalVoteSetupForm';
import ParticipantSelector, { AllowedParticipant } from './ParticipantSelector';

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
  flexDirection: 'column',
  overflow: 'auto',
});

interface LegalVoteFormProps {
  initialValues?: SavedLegalVoteForm;
  onClose: () => void;
  isCoffeeBreakActive: boolean;
}

const CreateLegalVoteForm = ({
  initialValues = defaultInitialValues,
  onClose,
  isCoffeeBreakActive,
}: LegalVoteFormProps) => {
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
    kind: yup.string().oneOf(Object.values(LegalVoteKind)),
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
        .min(1, t('legal-vote-input-assignments-required'))
        .required(t('legal-vote-input-assignments-required')),
    });
  }, [t]);

  const getCurrentValidationSchema = () => {
    return currentStep === 0 ? validationSchema : participantValidationSchema;
  };

  const renderStep = (formik: FormikProps<LegalVoteFormValues>) =>
    currentStep === 0 ? (
      <LegalVoteSetupForm formik={formik} t={t} />
    ) : (
      <ParticipantSelector name="allowedParticipants" />
    );

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
    const formContainsErrors = Object.keys(errors).length === 0;
    if (formContainsErrors) {
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
      <>
        {!isLastStep && <SaveAsTemplateButton onClick={() => saveFormValues(formik.values)} />}
        <Stack direction="row" spacing={1} mt="auto">
          <Button type="button" onClick={handlePrev} startIcon={<BackIcon />} fullWidth color="primary">
            {t('legal-vote-button-back')}
          </Button>
          <Button
            type="button"
            disabled={isCoffeeBreakActive}
            onClick={() => handleNext(formik)}
            fullWidth
            color="secondary"
          >
            {isLastStep ? t('poll-participant-list-button-start') : t('legal-vote-form-button-continue')}
          </Button>
        </Stack>
      </>
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
          <Form>
            <Typography paddingBottom={2}>
              {initialValues?.id !== undefined
                ? t('legal-vote-header-title-update')
                : t('legal-vote-header-title-create')}
            </Typography>
            {renderStep(formik)}
          </Form>
          {renderButtons(formik)}
        </Stack>
      )}
    </Formik>
  );
};

export default CreateLegalVoteForm;
