// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import Button from '@mui/material/Button';
import i18n from 'i18next';

import { StorageStatusReturn } from '../../../hooks/useStorageStatus';
import { notifications } from '../fragments';

type ShowStorageNearLimitNotificationProps = Omit<StorageStatusReturn, 'usagePercentage'> & {
  accountManagementUrl?: string;
};

export const showStorageNearLimitNotification = ({
  storageStatus,
  accountManagementUrl,
  canUpgrade,
}: ShowStorageNearLimitNotificationProps) => {
  const isNearLimit = storageStatus === 'near_limit';
  const isFull = storageStatus === 'full';

  if (!isFull && !isNearLimit) {
    return;
  }

  const messageKey = isFull ? 'conference-storage-full-warning' : 'conference-storage-near-limit-warning';

  const handleOpenAccount = () => window.open(accountManagementUrl, '_blank');

  if (canUpgrade) {
    notifications.binaryAction(i18n.t(messageKey), {
      primaryBtnText: i18n.t('global-upgrade'),
      secondaryBtnText: i18n.t('dashboard-settings-storage'),
      onPrimary: handleOpenAccount,
      onSecondary: handleOpenAccount,
    });
  } else {
    notifications.warning(i18n.t(messageKey), {
      action: <Button onClick={handleOpenAccount}>{i18n.t('dashboard-settings-storage')}</Button>,
    });
  }
};
