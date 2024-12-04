// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, Grid, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import { useGetMeQuery, useUpdateMeMutation } from '../../../../api/rest';
import { notifications, CommonTextField } from '../../../../commonComponents';
import { useAppSelector } from '../../../../hooks';
import { selectDisallowCustomDisplayName } from '../../../../store/slices/configSlice';
import { formikProps } from '../../../../utils/formikUtils';

const ProfileNameForm = () => {
  const { t } = useTranslation();
  const { data } = useGetMeQuery();
  const [updateMe, { isLoading }] = useUpdateMeMutation();
  const disallowCustomDisplayName = useAppSelector(selectDisallowCustomDisplayName);

  const validationSchema = yup.object({
    displayName: yup
      .string()
      .trim()
      .required(t('field-error-required', { fieldName: t('dashboard-settings-profile-name-label') })),
  });

  const formik = useFormik({
    initialValues: {
      displayName: data?.displayName,
    },
    enableReinitialize: true,
    validationSchema: validationSchema,
    onSubmit: (values) => {
      updateMe(values)
        .unwrap()
        .then(() => {
          notifications.success(t('dashboard-settings-general-notification-save-success'));
        })
        .catch(() => {
          notifications.error(t('dashboard-settings-general-notification-save-error'));
        });
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Grid container spacing={3} direction="column">
        <Grid item container spacing={1} direction="column">
          <Grid item>
            <CommonTextField
              disabled={disallowCustomDisplayName}
              {...formikProps('displayName', formik)}
              fullWidth
              // Autocomplete attribute on a disabled field makes no sense in terms of the UX and A11Y so we omit it.
              autoComplete={!disallowCustomDisplayName ? 'name' : undefined}
              label={t('dashboard-settings-profile-name-label')}
              placeholder={t('global-name-placeholder')}
              required
            />
          </Grid>
          <Grid item>
            <Typography variant="caption" component="p">
              {t('dashboard-settings-profile-input-hint')}
            </Typography>
          </Grid>
        </Grid>
        <Grid item>
          <Button type="submit" disabled={isLoading || disallowCustomDisplayName}>
            {t('dashboard-settings-profile-button-save')}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default ProfileNameForm;
