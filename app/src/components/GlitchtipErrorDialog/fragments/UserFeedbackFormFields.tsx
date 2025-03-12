// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
/* eslint-disable jsx-a11y/no-autofocus */
import { Stack, Typography } from '@mui/material';
import { FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';

import { CommonTextField } from '../../../commonComponents';
import { formikProps } from '../../../utils/formikUtils';

interface UserFeedbackFormFieldsProps<Values> {
  formik: FormikProps<Values>;
}

function UserFeedbackFormFields<Values>({ formik }: UserFeedbackFormFieldsProps<Values>) {
  const { t } = useTranslation();

  return (
    <Stack spacing={2}>
      <Typography>{t('glitchtip-crash-report-subtitle')}</Typography>
      <CommonTextField
        {...formikProps('name', formik)}
        label={t('glitchtip-crash-report-labelName')}
        placeholder={t('global-name-placeholder')}
        autoFocus
      />
      <CommonTextField
        {...formikProps('email', formik)}
        label={t('glitchtip-crash-report-labelEmail')}
        placeholder={t('global-email-placeholder')}
      />
      <CommonTextField
        {...formikProps('comments', formik)}
        label={t('glitchtip-crash-report-labelComments')}
        placeholder={t('glitchtip-crash-report-placeholderComments')}
        minRows={4}
        maxRows={6}
        multiline
      />
    </Stack>
  );
}

export default UserFeedbackFormFields;
