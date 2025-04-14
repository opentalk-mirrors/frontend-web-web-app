// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { WarningIcon, ErrorIcon } from '../../../assets/icons';
import DeviceList, { DeviceListProps } from './DeviceList';
import { DevicePermissionState } from './constants';

interface DeviceManagerProps extends DeviceListProps {
  state: DevicePermissionState;
}

const DeviceManager = ({ state, ...props }: DeviceManagerProps) => {
  const { t } = useTranslation();

  switch (state) {
    case DevicePermissionState.Confirmed:
      return <DeviceList {...props} />;
    case DevicePermissionState.Pending:
      return (
        <Stack alignItems="center" direction="row" gap={1}>
          <WarningIcon data-testid="warning-icon" />
          <Typography variant="body2">{t('device-permission-pending')}</Typography>
        </Stack>
      );
    case DevicePermissionState.Denied:
      return (
        <Stack alignItems="center" direction="row" gap={1}>
          <ErrorIcon data-testid="error-icon" />
          <Typography variant="body2">{t('device-permission-denied')}</Typography>
        </Stack>
      );
  }
};

export default DeviceManager;
