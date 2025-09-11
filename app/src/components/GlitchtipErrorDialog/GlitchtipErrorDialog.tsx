// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle as MuiDialogTitle,
  Paper,
  Stack,
  styled,
  Typography,
} from '@mui/material';
import { SdkInfo, Event } from '@sentry/browser';
import { useFormik } from 'formik';
import { pick } from 'lodash';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import { CloseIcon } from '../../assets/icons';
import { IconButton } from '../../commonComponents';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { selectGlitchtipConfig, selectIsGlitchtipConfigured } from '../../store/slices/configSlice';
import { selectErrorDialogEvent, selectShowErrorDialog, setShowErrorDialog } from '../../store/slices/uiSlice';
import { DELAY_BETWEEN_EVENT_AND_REPORT_MS } from '../../utils/glitchtipUtils';
import { sleep } from '../../utils/timeUtils';
import UserFeedbackFormFields from './fragments/UserFeedbackFormFields';

const DialogTitle = styled(MuiDialogTitle)(({ theme }) => ({
  display: 'inline-flex',
  justifyContent: 'space-between',
  alignContent: 'center',
  color: theme.palette.text.primary,
}));

const StacktracePaper = styled(Paper)(({ theme }) => ({
  maxHeight: '100px',
  overflowY: 'auto',
  padding: theme.spacing(1),
  backgroundColor: theme.palette.common.white,
  color: theme.palette.common.black,
}));

const CloseIconButton = styled(IconButton)(({ theme }) => ({
  '&:focus': {
    outline: theme.palette.focus.outline,
    outlineOffset: theme.palette.focus.outlineOffset,
  },
}));

export type UserFeedbackFormValues = {
  email: string;
  name: string;
  comments: string;
};

const GlitchtipErrorDialog = () => {
  const [dataHasBeenSent, setDataHasBeenSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const showErrorDialog = useAppSelector(selectShowErrorDialog);
  const glitchtipConfig = useAppSelector(selectGlitchtipConfig);
  const activeErrorReporting = useAppSelector(selectIsGlitchtipConfigured);
  const event = useAppSelector(selectErrorDialogEvent);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  if (!activeErrorReporting) {
    return null;
  }

  const validationSchema = yup.lazy(({ email, name, comments }) => {
    if (Boolean(email) || Boolean(name) || Boolean(comments)) {
      return yup.object({
        email: yup
          .string()
          .trim()
          .email(t('field-error-email'))
          .required(t('field-error-required', { fieldName: t('glitchtip-crash-report-labelEmail') })),
        name: yup
          .string()
          .trim()
          .required(t('field-error-required', { fieldName: t('glitchtip-crash-report-labelName') })),
        comments: yup
          .string()
          .trim()
          .required(t('field-error-required', { fieldName: t('glitchtip-crash-report-labelComments') })),
      });
    }
    return yup.mixed().notRequired();
  });

  const formik = useFormik<UserFeedbackFormValues>({
    initialValues: {
      email: '',
      name: '',
      comments: '',
    },
    validationSchema: validationSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async ({ email, name, comments }) => {
      setIsSubmitting(true);

      const url = new URL(glitchtipConfig?.dsn || '');

      const sdk: SdkInfo = {
        name: 'sentry.javascript.react',
        version: __SENTRY_VERSION__,
      };

      if (event) {
        // For some reason default value of the `sdk` is corrupt and confuses
        // the GlitchTip server. We need to fix it before sending the event.
        const fixedEvent: Partial<Event> = { ...event, sdk: { ...sdk } };

        await fetch(
          `${url.origin}/api${url.pathname}/envelope/?sentry_key=${url.username}&sentry_version=0&sentry_client=${sdk.name}/${sdk.version}`,
          {
            method: 'POST',
            body: `${JSON.stringify({
              ...pick(event, ['event_id', 'sent_at']),
              sdk,
              trace: event.sdkProcessingMetadata?.dynamicSamplingContext,
            })}
                  ${JSON.stringify({ type: 'event' })}
                  ${JSON.stringify(fixedEvent)}`,
          }
        );

        // We must wait to ensure the event is processed on the Glitchtip server side
        // before sending the report.
        // Otherwise the report will be not associated with the event and will be not visible
        // in the Glitchtip UI.
        await sleep(DELAY_BETWEEN_EVENT_AND_REPORT_MS);

        if (Boolean(email) || Boolean(name) || Boolean(comments)) {
          const formData = new FormData();
          formData.append('name', name);
          formData.append('email', email);
          formData.append('comments', comments);
          await fetch(`${url.origin}/api/embed/error-page/?dsn=${glitchtipConfig?.dsn}&eventId=${event.event_id}`, {
            method: 'POST',
            body: formData,
          });
        }
        setDataHasBeenSent(true);
        setIsSubmitting(false);
      }
    },
  });

  const handleCloseDialog = () => {
    dispatch(setShowErrorDialog({ showErrorDialog: false, event: undefined }));
  };

  const renderEventInfos = () =>
    event && (
      <>
        <Typography>{`${t('glitchtip-crash-report-error-subtitle')}:`}</Typography>
        <StacktracePaper elevation={7}>
          {event.exception?.values?.map(({ value, stacktrace }, index) => (
            <Stack spacing={1} key={index}>
              <Typography color="danger">{value}</Typography>
              {stacktrace?.frames?.map(({ filename, function: func, lineno, colno }, index) => (
                <Typography
                  key={index}
                  variant="caption"
                >{`${filename} in ${func} at line ${lineno}:${colno}`}</Typography>
              ))}
            </Stack>
          ))}
        </StacktracePaper>
      </>
    );

  const renderFormContent = () => (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pr: 2.5,
        }}
      >
        <DialogTitle>{t('glitchtip-crash-report-title')}</DialogTitle>
        <CloseIconButton aria-label={t('global-close-dialog')} onClick={handleCloseDialog}>
          <CloseIcon />
        </CloseIconButton>
      </Box>
      <DialogContent>
        <Stack spacing={2}>
          {renderEventInfos()}
          <UserFeedbackFormFields formik={formik} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="primary" onClick={handleCloseDialog} disabled={isSubmitting}>
          {t('glitchtip-crash-report-labelAbort')}
        </Button>
        <Button color="secondary" type="submit" disabled={isSubmitting}>
          {t('glitchtip-crash-report-labelSubmit')}
        </Button>
      </DialogActions>
    </>
  );

  const renderDataHasSentContent = () => (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <DialogTitle>{t('glitchtip-crash-report-send-successful-title')}</DialogTitle>
        <IconButton aria-label={t('global-close-dialog')} onClick={handleCloseDialog}>
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent>{t('glitchtip-crash-report-successMessage')}</DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog}>{t('glitchtip-crash-report-labelClose')}</Button>
      </DialogActions>
    </>
  );

  return (
    <Dialog
      slotProps={{
        transition: {
          onExited: () => setDataHasBeenSent(false),
        },
      }}
      open={showErrorDialog}
      onClose={handleCloseDialog}
      fullWidth
      maxWidth="md"
    >
      <form
        onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          formik.handleSubmit(event);
        }}
      >
        {dataHasBeenSent ? renderDataHasSentContent() : renderFormContent()}
      </form>
    </Dialog>
  );
};

export default GlitchtipErrorDialog;
