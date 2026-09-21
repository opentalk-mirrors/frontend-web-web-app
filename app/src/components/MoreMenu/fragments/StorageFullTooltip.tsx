// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Link, Tooltip } from '@mui/material';
import { Trans } from 'react-i18next';

interface StorageFullTooltipProps {
  accountManagementUrl?: string;
  canUpgrade: boolean;
  children: React.ReactNode;
}

const StorageFullTooltip = ({ accountManagementUrl, canUpgrade, children }: StorageFullTooltipProps) => (
  <Tooltip
    describeChild
    title={
      <Trans
        i18nKey={
          canUpgrade && accountManagementUrl
            ? 'conference-storage-tooltip-upgradeable-full-storage'
            : 'conference-storage-tooltip-full-storage'
        }
        components={{
          accountManagementLink: accountManagementUrl ? <Link href={accountManagementUrl} target="_blank" /> : <span />,
        }}
      />
    }
    slotProps={{ tooltip: { sx: { bgcolor: 'error.dark' } } }}
  >
    <span>{children}</span>
  </Tooltip>
);

export default StorageFullTooltip;
