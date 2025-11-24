// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Typography } from '@mui/material';
import { ConnectionState } from 'livekit-client';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { MicOnIcon } from '../../../assets/icons';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import useMediaDevice from '../../../hooks/useMediaDevice';
import { switchActiveDevice, switchLocalDevice } from '../../../store/commonActions';
import { selectAudioDeviceId, selectLivekitRoom } from '../../../store/slices/livekitSlice';
import { DeviceId } from '../../../types/device';
import DeviceManager from './DeviceManager';
import { DevicePermissionState } from './constants';

const AudioSettingsPanel = () => {
  const { t } = useTranslation();
  const { localDevices: devices, permissionDenied, loadLocalDevices } = useMediaDevice({ kind: 'audioinput' });
  const audioDeviceId = useAppSelector(selectAudioDeviceId);
  const dispatch = useAppDispatch();
  const room = useAppSelector(selectLivekitRoom);
  const roomState = room?.state;

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

  const handleSelectDevice = useCallback(
    async (deviceId: DeviceId) => {
      if (roomState === ConnectionState.Connected) {
        dispatch(switchActiveDevice({ deviceId, kind: 'audioinput' }));
      } else {
        dispatch(switchLocalDevice({ deviceId, kind: 'audioinput' }));
      }
    },
    [dispatch, roomState]
  );

  useEffect(() => {
    loadLocalDevices();
  }, [loadLocalDevices]);

  const devicePermissionState = useMemo(() => {
    if (permissionDenied === true) {
      return DevicePermissionState.Denied;
    }
    if (filteredDevices.length === 0 && permissionDenied === 'pending') {
      return DevicePermissionState.Pending;
    }
    return DevicePermissionState.Confirmed;
  }, [filteredDevices.length, permissionDenied]);

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
        state={devicePermissionState}
      />
    </>
  );
};

export default AudioSettingsPanel;
