// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Stack, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { VisuallyHiddenTitle } from '../../../commonComponents';
import { useUpdateDocumentTitle } from '../../../hooks/useUpdateDocumentTitle';
import { AssetSection } from './fragments/AssetSection';
import { StorageSection } from './fragments/StorageSection';

const ContainerStack = styled(Stack)(({ theme }) => ({
  background: theme.palette.background.main.primary,
  color: theme.palette.background.main.contrastText,
}));

const SettingsStoragePage = () => {
  const { t } = useTranslation();
  const pageHeading = t('dashboard-settings-storage-title');

  useUpdateDocumentTitle(pageHeading);

  return (
    <>
      <VisuallyHiddenTitle label={pageHeading} component="h2" />
      <ContainerStack spacing={5}>
        <StorageSection />
        <AssetSection />
      </ContainerStack>
    </>
  );
};

export default SettingsStoragePage;
