// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Switch, Grid, Tooltip, Select, MenuItem } from '@mui/material';
import { useFormikContext } from 'formik';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { DurationField, CommonTextField } from '../../../commonComponents';
import { CommonFormItem } from '../../../commonComponents';
import { LegalVoteFormValues, LegalVoteKind } from '../../../types';
import {
  formikDurationFieldProps,
  formikSwitchProps,
  formikProps,
  formikSelectProps,
} from '../../../utils/formikUtils';
import { DurationFieldWrapper } from '../../DurationFieldWrapper';

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
        <Select {...formikSelectProps('kind', formik)} defaultValue={formik.initialValues.kind} id="vote-kind">
          {Object.values(LegalVoteKind).map((kind) => (
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
          required
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
          required
        />
      </Grid>
    </Grid>
  );
};

export default LegalVoteSetupForm;
