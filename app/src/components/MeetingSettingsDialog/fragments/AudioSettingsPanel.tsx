// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Typography } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { MicOnIcon } from '../../../assets/icons';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import useMediaDevice from '../../../hooks/useMediaDevice';
import { selectAudioDeviceId, setAudioDeviceId } from '../../../store/slices/mediaSlice';
import { DeviceId } from '../../../types/device';
import DeviceManager from './DeviceManager';
import { DevicePermissionState } from './constants';

const AudioSettingsPanel = () => {
  const { t } = useTranslation();
  const { localDevices: devices, permissionDenied, loadLocalDevices } = useMediaDevice({ kind: 'audioinput' });
  const audioDeviceId = useAppSelector(selectAudioDeviceId);
  const dispatch = useAppDispatch();

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

  const handleSelectDevice = async (deviceId: DeviceId) => {
    dispatch(setAudioDeviceId(deviceId));
  };

  useEffect(() => {
    loadLocalDevices();
  }, []);

  const getDevicesState = (): DevicePermissionState => {
    if (permissionDenied === true) {
      return DevicePermissionState.Denied;
    }
    if (filteredDevices.length === 0 && permissionDenied === 'pending') {
      return DevicePermissionState.Pending;
    }
    return DevicePermissionState.Confirmed;
  };

  return (
    <>
      <Typography variant="h2" alignSelf="start" pb={2}>
        {t('audio-settings-title')}
      </Typography>
      <DeviceManager
        devices={devices}
        selectedDevice={audioDeviceId as DeviceId | undefined}
        onSelectDevice={handleSelectDevice}
        subheader={{
          title: t('audiomenu-choose-input'),
          titleIcon: <MicOnIcon />,
        }}
        state={getDevicesState()}
      />
    </>
  );
};

export default AudioSettingsPanel;
