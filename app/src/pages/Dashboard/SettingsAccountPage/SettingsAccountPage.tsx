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
      <VisuallyHiddenTitle label={pageHeading} component="h2" />
      <Grid container spacing={5} direction="column">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Typography variant="h1" component="h2">
              {t('dashboard-settings-account-section-title')}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CommonTextField
              label={t('dashboard-settings-account-email-label')}
              value={data?.email}
              InputProps={{ readOnly: true }}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <CommonTextField
              label={t('dashboard-settings-account-firstname-label')}
              value={data?.firstname}
              InputProps={{ readOnly: true }}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <CommonTextField
              label={t('dashboard-settings-account-familyname-label')}
              value={data?.lastname}
              InputProps={{ readOnly: true }}
              fullWidth
            />
          </Grid>
        </Grid>

        {changePassword.active && changePassword.url && (
          <>
            <Grid>
              <Divider />
            </Grid>
            <Grid container spacing={3} direction="column">
              <Grid>
                <Typography variant="h1" component="h2">
                  {t('global-password')}
                </Typography>
              </Grid>
              <Grid>
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
