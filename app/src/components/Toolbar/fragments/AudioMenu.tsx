// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { ListItemText, ThemeProvider, Typography, styled } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { ErrorIcon, MicOnIcon, WarningIcon } from '../../../assets/icons';
import { createOpenTalkTheme } from '../../../assets/themes/opentalk';
import { useAppSelector } from '../../../hooks';
import { useFullscreenContext } from '../../../hooks/useFullscreenContext';
import useMediaDevice from '../../../hooks/useMediaDevice';
import { selectAudioDeviceId } from '../../../store/slices/mediaSlice';
import { DeviceId } from '../../../types/device';
import DeviceList from './DeviceList';
import { MenuSectionTitle, ToolbarMenu, ToolbarMenuProps } from './ToolbarMenuUtils';

const MultilineTypography = styled(Typography)({
  whiteSpace: 'pre-wrap',
});

const AudioMenu = ({ anchorEl, onClose, open }: ToolbarMenuProps) => {
  const { t } = useTranslation();
  const audioDeviceId = useAppSelector(selectAudioDeviceId);
  const {
    startMedia,
    localDevices: devices,
    permissionDenied,
    loadLocalDevices,
  } = useMediaDevice({ kind: 'audioinput' });

  // Some browsers (e.g. Firefox) duplicate devices, so we need to filter them out
  const filteredDevices = useMemo(() => {
    const seenDeviceIds = new Set<string>();

    return devices
      .filter((device) => {
        if (device.deviceId === '' || seenDeviceIds.has(device.deviceId)) {
          return false;
        }
        seenDeviceIds.add(device.deviceId);
        return true;
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [devices]);

  const fullscreenHandle = useFullscreenContext();

  const handleClick = async (deviceId: DeviceId) => {
    if (deviceId !== audioDeviceId) {
      await startMedia(false, deviceId);
    }
  };

  useEffect(() => {
    if (open) {
      loadLocalDevices('audioinput');
    }
  }, [open]);

  // Todo show spinner while we fetch the permissions?
  return (
    <ThemeProvider theme={createOpenTalkTheme()}>
      <ToolbarMenu
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: -4,
          horizontal: 'center',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        disablePortal={fullscreenHandle.active}
        id="audio-context-menu"
        aria-labelledby="audio-menu-title"
        role="listbox"
      >
        <MenuSectionTitle id="audio-menu-title" sx={{ pt: 1.5, pb: 1.5 }}>
          <MicOnIcon />
          {t('audiomenu-choose-input')}
        </MenuSectionTitle>

        {permissionDenied === true && (
          <MenuSectionTitle>
            <ErrorIcon />
            <MultilineTypography variant="body2">{t('device-permission-denied')}</MultilineTypography>
          </MenuSectionTitle>
        )}

        {filteredDevices.length === 0 && permissionDenied === 'pending' ? (
          <MenuSectionTitle>
            <WarningIcon />
            <ListItemText>{t('devicemenu-wait-for-permission')}</ListItemText>
          </MenuSectionTitle>
        ) : (
          <DeviceList
            devices={filteredDevices}
            selectedDevice={audioDeviceId as DeviceId | undefined}
            onClick={handleClick}
            ariaLabelId="audio-menu-title"
          />
        )}
      </ToolbarMenu>
    </ThemeProvider>
  );
};

export default AudioMenu;
