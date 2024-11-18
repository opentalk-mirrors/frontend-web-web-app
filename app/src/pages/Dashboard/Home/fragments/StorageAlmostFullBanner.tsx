// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, Stack, Typography } from '@mui/material';
import { useTranslation, Trans } from 'react-i18next';
import { Link } from 'react-router-dom';

import { useGetMeTariffQuery, useGetMeQuery } from '../../../../api/rest';
import { useAppSelector } from '../../../../hooks';
import { selectAccountManagementUrl } from '../../../../store/slices/configSlice';
import { AlertBanner } from './AlertBanner';
import { STORAGE_SECTION_PATH, CRITICAL_STORAGE_CAPACITY_IN_PERCENT } from './constants';

const AlertActions = () => {
  const { t } = useTranslation();
  const accountManagementUrl = useAppSelector(selectAccountManagementUrl);
  return (
    <Stack direction="row" spacing={1}>
      <Button
        size="medium"
        onClick={() => {
          window.open(accountManagementUrl, '_self');
        }}
        focusRipple
      >
        {t('global-upgrade')}
      </Button>
      <Button size="medium" focusRipple component={Link} to={STORAGE_SECTION_PATH}>
        {t('dashboard-settings-storage')}
      </Button>
    </Stack>
  );
};

export const StorageAlmostFullBanner = () => {
  const { data: userData, isLoading: isUserDataLoading } = useGetMeQuery();
  const { data: tariffData, isLoading: isTariffDataLoading } = useGetMeTariffQuery();
  const usedStorage = userData?.usedStorage;
  const maxStorage = tariffData?.quotas.maxStorage;

  if (isUserDataLoading || isTariffDataLoading || usedStorage === undefined) {
    return null;
  }

  // unlimited storage capacity
  if (!maxStorage) {
    return null;
  }

  const criticalCapacityReached = usedStorage >= maxStorage * (CRITICAL_STORAGE_CAPACITY_IN_PERCENT / 100);
  if (!criticalCapacityReached) {
    return null;
  }

  return (
    <AlertBanner icon={false} variant="filled" severity="error" action={<AlertActions />}>
      <Typography>
        <Trans i18nKey="dashboard-storage-almost-full-message" />
      </Typography>
    </AlertBanner>
  );
};
