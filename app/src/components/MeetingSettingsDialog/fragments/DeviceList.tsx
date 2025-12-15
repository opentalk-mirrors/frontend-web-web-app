// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ListItemIcon, ListItemText, ListSubheader, Typography } from '@mui/material';
import { ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { DoneIcon } from '../../../assets/icons';
import { DeviceId } from '../../../types/device';
import DeviceListMenuItem from './DeviceListMenuItem';
import StyledMenuList from './StyledMenuList';

interface DeviceListSubheader {
  title: string;
  titleIcon?: ReactNode;
}

export interface DeviceListProps {
  devices: Array<MediaDeviceInfo> | undefined;
  selectedDevice: DeviceId | undefined;
  onSelectDevice: (deviceId: DeviceId) => void;
  subheader: DeviceListSubheader;
}

const DeviceList = (props: DeviceListProps) => {
  const {
    devices,
    selectedDevice,
    onSelectDevice,
    subheader: { title, titleIcon },
  } = props;

  const { t } = useTranslation();

  const deviceList = useMemo(
    () =>
      devices?.map(({ deviceId, label }) => {
        const isSelected = Boolean(selectedDevice && deviceId === selectedDevice);
        return (
          <DeviceListMenuItem
            selected={isSelected}
            key={deviceId}
            onClick={() => onSelectDevice(deviceId as DeviceId)}
            role="menuitemradio"
            aria-checked={isSelected}
          >
            {isSelected && (
              <ListItemIcon>
                <DoneIcon data-testid="done-icon" />
              </ListItemIcon>
            )}
            <ListItemText inset={!isSelected}>
              <Typography variant="inherit" noWrap>
                {label}
              </Typography>
            </ListItemText>
          </DeviceListMenuItem>
        );
      }),
    [devices, selectedDevice, onSelectDevice]
  );

  return (
    <StyledMenuList
      aria-labelledby="device-list-subheader"
      subheader={
        <ListSubheader id="device-list-subheader">
          {titleIcon}
          {title}
        </ListSubheader>
      }
    >
      {deviceList || t('no-devices-found')}
    </StyledMenuList>
  );
};

export default DeviceList;
