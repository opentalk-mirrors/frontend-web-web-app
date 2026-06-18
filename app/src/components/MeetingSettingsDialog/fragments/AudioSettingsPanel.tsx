// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Divider, Typography } from '@mui/material';
import { ConnectionState } from 'livekit-client';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { MicOnIcon, VolumeIcon } from '../../../assets/icons';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import useMediaDevice from '../../../hooks/useMediaDevice';
import { switchActiveDevice, switchLocalDevice } from '../../../store/commonActions';
import {
  selectAudioInputDeviceId,
  selectAudioOutputDeviceId,
  selectLivekitRoom,
} from '../../../store/slices/livekitSlice';
import { DeviceId } from '../../../types/device';
import DeviceManager from './DeviceManager';
import { DevicePermissionState } from './constants';

function filterDuplicateDevices(devices: MediaDeviceInfo[]) {
  const seenDeviceIds = new Set<string>();

  return devices.filter((device) => {
    if (device.deviceId === '' || seenDeviceIds.has(device.deviceId)) {
      return false;
    }
    seenDeviceIds.add(device.deviceId);
    return true;
  });
}

function getDevicePermissionState(permissionDenied: boolean | 'pending', devices: MediaDeviceInfo[]) {
  if (permissionDenied === true) {
    return DevicePermissionState.Denied;
  }
  if (devices.length === 0 && permissionDenied === 'pending') {
    return DevicePermissionState.Pending;
  }
  return DevicePermissionState.Confirmed;
}

function sortDevicesByLabel(devices: MediaDeviceInfo[]) {
  return [...devices].sort((a, b) => a.label.localeCompare(b.label));
}

const AudioSettingsPanel = () => {
  const { t } = useTranslation();
  const {
    localDevices: inputDevices,
    permissionDenied: inputPermissionDenied,
    loadLocalDevices: loadLocalInputDevices,
  } = useMediaDevice({ kind: 'audioinput' });
  const {
    localDevices: outputDevices,
    permissionDenied: outputPermissionDenied,
    loadLocalDevices: loadLocalOutputDevices,
  } = useMediaDevice({ kind: 'audiooutput' });
  const audioInputDeviceId = useAppSelector(selectAudioInputDeviceId);
  const audioOutputDeviceId = useAppSelector(selectAudioOutputDeviceId);
  const dispatch = useAppDispatch();
  const room = useAppSelector(selectLivekitRoom);
  const roomState = room?.state;

  // Some browsers (e.g. Firefox) duplicate inputDevices, so we need to filter them out
  const filteredInputDevices = useMemo(() => sortDevicesByLabel(filterDuplicateDevices(inputDevices)), [inputDevices]);
  const filteredOutputDevices = useMemo(
    () => sortDevicesByLabel(filterDuplicateDevices(outputDevices)),
    [outputDevices]
  );

  const handleSelectDevice = useCallback(
    async (deviceId: DeviceId, kind: MediaDeviceKind) => {
      if (roomState === ConnectionState.Connected) {
        dispatch(switchActiveDevice({ deviceId, kind }));
      } else {
        dispatch(switchLocalDevice({ deviceId, kind }));
      }
    },
    [dispatch, roomState]
  );

  useEffect(() => {
    loadLocalInputDevices();
    loadLocalOutputDevices();
  }, [loadLocalInputDevices, loadLocalOutputDevices]);

  const inputDevicePermissionState = useMemo(
    () => getDevicePermissionState(inputPermissionDenied, filteredInputDevices),
    [inputPermissionDenied, filteredInputDevices]
  );
  const outputDevicePermissionState = useMemo(
    () => getDevicePermissionState(outputPermissionDenied, filteredOutputDevices),
    [outputPermissionDenied, filteredOutputDevices]
  );

  return (
    <>
      <Typography variant="h2" alignSelf="start" pb={2}>
        {t('audio-settings-title')}
      </Typography>
      <DeviceManager
        devices={filteredInputDevices}
        selectedDevice={audioInputDeviceId as DeviceId | undefined}
        onSelectDevice={handleSelectDevice}
        kind="audioinput"
        subheader={{
          title: t('audiomenu-choose-input'),
          titleIcon: <MicOnIcon />,
        }}
        state={inputDevicePermissionState}
      />
      <Divider />
      <DeviceManager
        devices={filteredOutputDevices}
        selectedDevice={audioOutputDeviceId as DeviceId | undefined}
        onSelectDevice={handleSelectDevice}
        kind="audiooutput"
        subheader={{
          title: t('audiomenu-choose-output'),
          titleIcon: <VolumeIcon />,
        }}
        state={outputDevicePermissionState}
      />
    </>
  );
};

export default AudioSettingsPanel;
