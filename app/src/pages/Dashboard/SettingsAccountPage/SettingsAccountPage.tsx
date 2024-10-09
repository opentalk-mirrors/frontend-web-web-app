// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, Divider, Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useGetMeQuery } from '../../../api/rest';
import { CommonTextField, VisuallyHiddenTitle } from '../../../commonComponents';
import { useAppSelector } from '../../../hooks';
import { useUpdateDocumentTitle } from '../../../hooks/useUpdateDocumentTitle';
import { selectChangePassword } from '../../../store/slices/configSlice';

const SettingsAccountPage = () => {
  const { t } = useTranslation();
  const { data } = useGetMeQuery();
  const changePassword = useAppSelector(selectChangePassword);
  const pageHeading = t('dashboard-settings-account-title');

  useUpdateDocumentTitle(pageHeading);

  return (
    <>
      <VisuallyHiddenTitle label={pageHeading} component="h1" />
      <Grid container spacing={5} direction="column">
        <Grid item container spacing={3}>
          <Grid xs={12} item>
            <Typography variant="h1" component="h2">
              {t('dashboard-settings-account-section-title')}
            </Typography>
          </Grid>
          <Grid xs={12} item>
            <CommonTextField
              label={t('dashboard-settings-account-email-label')}
              value={data?.email}
              disabled
              fullWidth
            />
          </Grid>
          <Grid xs={6} item>
            <CommonTextField
              label={t('dashboard-settings-account-firstname-label')}
              value={data?.firstname}
              disabled
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <CommonTextField
              label={t('dashboard-settings-account-familyname-label')}
              value={data?.lastname}
              disabled
              fullWidth
            />
          </Grid>
        </Grid>

        {changePassword.active && changePassword.url && (
          <>
            <Grid item>
              <Divider />
            </Grid>
            <Grid item container spacing={3} direction="column">
              <Grid item>
                <Typography variant="h1" component="h2">
                  {t('global-password')}
                </Typography>
              </Grid>
              <Grid item>
                <Button color="secondary" href={changePassword.url}>
                  {t('dashboard-settings-account-change-password-button')}
                </Button>
              </Grid>
            </Grid>
          </>
        )}
      </Grid>
    </>
  );
};

export default SettingsAccountPage;
