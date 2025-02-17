// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
//
import { useMediaDeviceSelect } from '@livekit/components-react';
import { Room } from 'livekit-client';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '.';
import { notifications } from '../commonComponents';
import { selectAudioDeviceId, selectVideoDeviceId, setMediaChangeInProgress } from '../store/slices/mediaSlice';
import { ConnectionState, selectRoomConnectionState } from '../store/slices/roomSlice';

interface MediaPermissionsConstraints {
  kind: MediaDeviceKind;
  deviceId?: ConstrainDOMString;
}

const useMediaDevice = ({ kind }: MediaPermissionsConstraints) => {
  const { t } = useTranslation();
  const [permissionDenied, setPermissionDenied] = useState<boolean | 'pending'>(false);
  const [localDevices, setLocalDevices] = useState<MediaDeviceInfo[]>([]);
  const videoDeviceId = useAppSelector(selectVideoDeviceId);
  const audioDeviceId = useAppSelector(selectAudioDeviceId);
  const dispatch = useAppDispatch();
  const { devices, setActiveMediaDevice } = useMediaDeviceSelect({
    kind,
    requestPermissions: false,
  });
  const connectionState: ConnectionState = useAppSelector(selectRoomConnectionState);

  useEffect(() => {
    if (connectionState === ConnectionState.Online || connectionState === ConnectionState.Leaving) {
      if (kind === 'audioinput' && audioDeviceId) {
        setActiveMediaDevice(audioDeviceId);
      }
      if (kind === 'videoinput' && videoDeviceId) {
        setActiveMediaDevice(videoDeviceId);
      }
    }
  }, [kind, videoDeviceId, audioDeviceId, setActiveMediaDevice, connectionState]);

  const loadLocalDevices = async () => {
    dispatch(setMediaChangeInProgress(kind));
    try {
      setLocalDevices(await Room.getLocalDevices(kind, true));
    } catch (error) {
      setPermissionDenied(true);
      setLocalDevices([]);
      console.debug(`Permission or ${kind} toggle failed: ${error}`);
      notifications.warning(t('media-denied-warning', { mediaType: kind }), {
        preventDuplicate: true,
      });
    } finally {
      dispatch(setMediaChangeInProgress(null));
    }
  };

  return {
    permissionDenied,
    devices,
    localDevices,
    loadLocalDevices,
    setActiveMediaDevice,
  };
};

export default useMediaDevice;
