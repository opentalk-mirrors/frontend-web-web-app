// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { VisuallyHiddenTitle } from '../../../commonComponents';
import { useUpdateDocumentTitle } from '../../../hooks/useUpdateDocumentTitle';
import { AssetSection } from './fragments/AssetSection';
import { StorageSection } from './fragments/StorageSection';

const SettingsStoragePage = () => {
  const { t } = useTranslation();
  const pageHeading = t('dashboard-settings-storage-title');

  useUpdateDocumentTitle(pageHeading);

  return (
    <>
      <VisuallyHiddenTitle label={pageHeading} component="h2" />
      <Stack spacing={5}>
        <StorageSection />
        <AssetSection />
      </Stack>
    </>
  );
};

export default SettingsStoragePage;
