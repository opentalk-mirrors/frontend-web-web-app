// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Divider, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { VisuallyHiddenTitle } from '../../../commonComponents';
import ProfilePicture from '../../../components/ProfilePicture';
import { RequiredFieldsInfo } from '../../../components/RequiredFieldsInfo';
import { useUpdateDocumentTitle } from '../../../hooks/useUpdateDocumentTitle';
import ProfileNameForm from './fragments/ProfileNameForm';

const SettingsProfilePage = () => {
  const { t } = useTranslation();
  const pageHeading = t('dashboard-settings-profile-title');

  useUpdateDocumentTitle(pageHeading);

  return (
    <>
      <VisuallyHiddenTitle label={pageHeading} component="h2" />
      <Stack spacing={5}>
        <Stack spacing={3}>
          <Typography variant="h1" component="h3">
            {t('dashboard-settings-profile-picture')}
          </Typography>
          <RequiredFieldsInfo />
          <ProfilePicture size="big" />
        </Stack>
        <Divider />
        <ProfileNameForm />
      </Stack>
    </>
  );
};

export default SettingsProfilePage;
