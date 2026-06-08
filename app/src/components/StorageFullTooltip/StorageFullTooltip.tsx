// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Link as MUILink, Tooltip } from '@mui/material';
import { Trans } from 'react-i18next';

import { useAppSelector } from '../../hooks';
import { useStorageStatus } from '../../hooks/useStorageStatus';
import { selectAccountManagementUrl } from '../../store/slices/configSlice';

interface StorageFullTooltipProps {
  children: React.ReactNode;
}

const StorageFullTooltip = ({ children }: StorageFullTooltipProps) => {
  const { storageStatus, canUpgrade } = useStorageStatus();
  const accountManagementUrl = useAppSelector(selectAccountManagementUrl);

  if (storageStatus === 'full') {
    return (
      <Tooltip
        describeChild
        title={
          <Trans
            i18nKey={
              canUpgrade
                ? 'conference-storage-tooltip-upgradeable-full-storage'
                : 'conference-storage-tooltip-full-storage'
            }
            components={{
              accountManagementLink: accountManagementUrl ? (
                <MUILink href={accountManagementUrl} target="_blank" />
              ) : (
                <span />
              ),
            }}
          />
        }
        slotProps={{ tooltip: { sx: { bgcolor: 'error.dark' } } }}
      >
        <span>{children}</span>
      </Tooltip>
    );
  }
  return children;
};

export default StorageFullTooltip;
