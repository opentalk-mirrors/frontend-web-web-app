// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ListItemIcon, ListItemText, MenuList, Typography } from '@mui/material';

import { DoneIcon } from '../../../assets/icons';
import { DeviceId } from '../../../types/device';
import { ToolbarMenuItem } from './ToolbarMenuUtils';

interface DevicelistProps {
  devices: Array<MediaDeviceInfo>;
  selectedDevice: DeviceId | undefined;
  onClick: (deviceId: DeviceId) => void;
  ariaLabelId: string;
}

const DeviceList = ({ devices, selectedDevice, onClick, ariaLabelId }: DevicelistProps) => {
  return (
    <MenuList aria-labelledby={ariaLabelId} autoFocusItem role="listbox">
      {devices.map(({ deviceId, label }) => (
        <ToolbarMenuItem
          selected={selectedDevice && deviceId === selectedDevice}
          key={deviceId}
          onClick={() => onClick(deviceId as DeviceId)}
        >
          {selectedDevice && deviceId === selectedDevice ? (
            <>
              <ListItemIcon>
                <DoneIcon />
              </ListItemIcon>
              <Typography variant="inherit" noWrap>
                {label}
              </Typography>
            </>
          ) : (
            <ListItemText inset>
              <Typography variant="inherit" noWrap>
                {label}
              </Typography>
            </ListItemText>
          )}
        </ToolbarMenuItem>
      ))}
    </MenuList>
  );
};

export default DeviceList;
