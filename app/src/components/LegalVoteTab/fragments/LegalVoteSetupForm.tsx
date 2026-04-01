// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Switch, Grid, Tooltip } from '@mui/material';
import { useFormikContext } from 'formik';
import { useEffect } from 'react';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { DurationField, CommonTextField } from '../../../commonComponents';
import { CommonFormItem } from '../../../commonComponents';
import { LegalVoteFormValues } from '../../../types';
import { formikDurationFieldProps, formikSwitchProps, formikProps } from '../../../utils/formikUtils';
import { DurationFieldWrapper } from '../../DurationFieldWrapper';

const MAX_TITLE_CHARACTERS = 150;
const MAX_SUBTITLE_CHARACTERS = 255;
const MAX_TOPIC_CHARACTERS = 500;

export const LegalVoteSetupForm = () => {
  const { validateForm, ...restFormik } = useFormikContext<LegalVoteFormValues>();
  const { t } = useTranslation();

  useEffect(() => {
    validateForm();
  }, [validateForm]);

  const formik = { validateForm, ...restFormik };
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }} sx={{ position: 'relative' }}>
        <DurationFieldWrapper paddingTop={1}>
          <DurationField
            {...formikDurationFieldProps('duration', formik)}
            durationOptions={[null, 1, 2, 5, 'custom']}
            setFieldValue={formik.setFieldValue}
            ButtonProps={{
              size: 'small',
            }}
          />
        </DurationFieldWrapper>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <CommonFormItem
          name="pseudonymous"
          onChange={(e: ChangeEvent<unknown>) => {
            const target = e.target as HTMLInputElement;
            const checked = target.checked;

            formik.setFieldValue('pseudonymous', checked);
            if (checked) {
              formik.setFieldValue('live', false);
            }
          }}
          onBlur={formik.handleBlur}
          control={<Switch color="primary" checked={formik.values.pseudonymous} />}
          label={t('legal-vote-form-allow-pseudonymous')}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <CommonFormItem
          {...formikSwitchProps('live', formik)}
          control={<Switch color="primary" disabled={formik.values.pseudonymous} />}
          label={t('legal-vote-form-live')}
        />
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
        <CommonTextField
          {...formikProps('name', formik)}
          label={t('legal-vote-title-label')}
          placeholder={t('legal-vote-title-placeholder')}
          maxCharacters={MAX_TITLE_CHARACTERS}
          showLimitAt={0}
          fullWidth
          required
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <CommonTextField
          {...formikProps('subtitle', formik)}
          label={t('legal-vote-subtitle-label')}
          placeholder={t('legal-vote-subtitle-placeholder')}
          maxCharacters={MAX_SUBTITLE_CHARACTERS}
          showLimitAt={0}
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
          maxCharacters={MAX_TOPIC_CHARACTERS}
          showLimitAt={0}
          fullWidth
          required
        />
      </Grid>
    </Grid>
  );
};

export default LegalVoteSetupForm;
