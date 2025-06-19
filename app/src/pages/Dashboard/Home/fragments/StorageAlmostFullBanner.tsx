// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Button, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { useGetMeTariffQuery, useGetMeQuery } from '../../../../api/rest';
import { useAppSelector } from '../../../../hooks';
import { selectAccountManagementUrl } from '../../../../store/slices/configSlice';
import { isFeatureEnabledPredicate } from '../../../../utils/moduleUtils';
import { AlertBanner } from './AlertBanner';
import { STORAGE_SECTION_PATH, CRITICAL_STORAGE_CAPACITY_IN_PERCENT } from './constants';

const AlertActions = ({ isStorageUpgradable }: { isStorageUpgradable: boolean }) => {
  const { t } = useTranslation();
  const accountManagementUrl = useAppSelector(selectAccountManagementUrl);

  const openAccountManagementUrl = () => {
    window.open(accountManagementUrl, '_self');
  };

  return (
    <Stack direction="row" spacing={1}>
      {isStorageUpgradable && (
        <Button size="medium" onClick={openAccountManagementUrl} focusRipple>
          {t('global-upgrade')}
        </Button>
      )}
      <Button size="medium" focusRipple component={Link} to={STORAGE_SECTION_PATH}>
        {t('dashboard-settings-storage')}
      </Button>
    </Stack>
  );
};

export const StorageAlmostFullBanner = () => {
  const { t } = useTranslation();
  const { data: userData, isLoading: isUserDataLoading } = useGetMeQuery();
  const { data: tariffData, isLoading: isTariffDataLoading } = useGetMeTariffQuery();
  const isStorageUpgradable = Boolean(
    tariffData && isFeatureEnabledPredicate('storage_upgradable', tariffData.modules)
  );
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
    <AlertBanner
      icon={false}
      variant="filled"
      severity="error"
      action={<AlertActions isStorageUpgradable={isStorageUpgradable} />}
    >
      <Typography>{t('dashboard-storage-almost-full-message')}</Typography>
      <Typography>
        {t(`dashboard-storage-almost-full-message-${isStorageUpgradable ? 'upgrade' : 'delete'}`)}
      </Typography>
    </AlertBanner>
  );
};
