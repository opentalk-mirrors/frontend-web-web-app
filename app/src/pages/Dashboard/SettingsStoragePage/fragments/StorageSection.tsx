// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { LinearProgress, Link, Stack, Typography, linearProgressClasses, styled } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';

import { useGetMeQuery, useGetMeTariffQuery } from '../../../../api/rest';
import { useAppSelector } from '../../../../hooks';
import log from '../../../../logger';
import { selectAccountManagementUrl } from '../../../../store/slices/configSlice';
import { formatBytes } from '../../../../utils/numberUtils';

const PlanUpgradeLink = styled(Link)(({ theme }) => ({
  color: theme.palette.error.main,
}));

const StorageProgress = styled(LinearProgress)(({ theme, value }) => ({
  height: '3rem',
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.secondary.contrastText,
    borderRadius: '0.3rem',
    borderStyle: 'solid',
    borderWidth: '0.1rem',
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: '0.2rem',
    backgroundColor: value !== undefined && value < 100 ? theme.palette.secondary.main : theme.palette.error.main,
  },
}));

interface StorageFullMessageProps {
  usedStorage: string;
  maxStorage: string;
}

const StorageFullMessage = ({ usedStorage, maxStorage }: StorageFullMessageProps) => {
  const accountManagementUrl = useAppSelector(selectAccountManagementUrl);
  return (
    <Trans
      i18nKey="dashboard-settings-storage-usage-limited-full"
      values={{ usedStorage, maxStorage }}
      components={{
        planUpgradeLink: accountManagementUrl ? (
          <PlanUpgradeLink href={accountManagementUrl} target="_blank" />
        ) : (
          <span />
        ),
      }}
    />
  );
};

/*
  Normal case is when used storage and max storage are defined (limited storage)
  
  It can happen, that max storage is not set for the user, as it is an optional plan quota.
  In case max storage is undeifned, we assume that the user has unlimited storage and we don't show the progress bar.
*/
const StorageUsage = () => {
  const { t } = useTranslation();
  const { data: userData, isLoading: isUserDataLoading } = useGetMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const { data: tariffData, isLoading: isTariffDataLoading } = useGetMeTariffQuery();
  const usedStorage = userData?.usedStorage;
  const maxStorage = tariffData?.quotas.maxStorage;

  const getLimitedStorageText = (usedStorage: number, maxStorage: number) => {
    const formattedUsedStorage = formatBytes(usedStorage, { decimals: 0 });
    const formattedMaxStorage = formatBytes(maxStorage, { decimals: 0 });
    if (usedStorage < maxStorage) {
      return t(`dashboard-settings-storage-usage-limited-free`, {
        usedStorage: formattedUsedStorage,
        maxStorage: formattedMaxStorage,
      });
    } else {
      return <StorageFullMessage usedStorage={formattedUsedStorage} maxStorage={formattedMaxStorage} />;
    }
  };

  const getUnlimitedStorageText = (usedStorage: number) => {
    const formattedUsedStorage = formatBytes(usedStorage, { decimals: 0 });
    return t(`dashboard-settings-storage-usage-unlimited`, { usedStorage: formattedUsedStorage });
  };

  // controller has not responded yet -> show loading progress bar
  if (isUserDataLoading || isTariffDataLoading) {
    return (
      <Stack spacing={1}>
        <Typography variant="body1">{t('dashboard-settings-storage-usage-loading')}</Typography>
        <StorageProgress variant="query" value={0} />
      </Stack>
    );
  }

  // shall never happen as controller shall always return this information
  if (usedStorage === undefined) {
    log.error('Used storage value cannot be undefined');
    return null;
  }

  // max storage quota is not set -> user has unlimited storage
  if (!maxStorage) {
    return <Typography variant="body1">{getUnlimitedStorageText(usedStorage)}</Typography>;
  }

  // casual case: user has limited storage
  const realOccupancyInPercents = Math.floor((usedStorage / maxStorage) * 100);
  const displayedOccupancy = Math.min(realOccupancyInPercents, 100);
  const isFull = displayedOccupancy >= 100;
  return (
    <Stack spacing={1}>
      <Typography variant="body1" color={isFull ? 'error' : 'secondary'}>
        {getLimitedStorageText(usedStorage, maxStorage)}
      </Typography>
      <StorageProgress variant="determinate" value={displayedOccupancy} />
    </Stack>
  );
};

export const StorageSection = () => {
  const { t } = useTranslation();
  return (
    <Stack spacing={2}>
      <Typography variant="h1" component="h2">
        {t('dashboard-settings-storage')}
      </Typography>
      <StorageUsage />
    </Stack>
  );
};
