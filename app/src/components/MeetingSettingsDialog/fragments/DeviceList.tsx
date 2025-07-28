// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ListItemIcon, ListItemText, ListSubheader, MenuItem, MenuList, Typography, styled } from '@mui/material';
import { ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { DoneIcon } from '../../../assets/icons';
import { DeviceId } from '../../../types/device';

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

export const StyledMenuList = styled(MenuList)(({ theme }) => ({
  paddingRight: theme.spacing(1.5),
  '& .MuiSvgIcon-root': {
    color: 'currentColor',
    fontSize: '1.15em',
  },
  '& .MuiListSubheader-root': {
    color: 'currentColor',
    backgroundColor: 'inherit',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(0, 1.5, 1),
    fontSize: '1rem',
    font: 'inherit',
  },
}));

export const DeviceListMenuItem = styled(MenuItem)(() => ({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  fontSize: '0.875rem',
}));

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
