// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
//
import { useMediaDeviceSelect } from '@livekit/components-react';
import { Room } from 'livekit-client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { notifications } from '../commonComponents';
import log from '../logger';
import { setMediaChangeInProgress } from '../store/slices/mediaSlice';
import { useAppDispatch } from './useCustomRedux';

interface MediaPermissionsConstraints {
  kind: MediaDeviceKind;
  deviceId?: ConstrainDOMString;
}

const useMediaDevice = ({ kind }: MediaPermissionsConstraints) => {
  const { t } = useTranslation();
  const [permissionDenied, setPermissionDenied] = useState<boolean | 'pending'>(false);
  const [localDevices, setLocalDevices] = useState<MediaDeviceInfo[]>([]);
  const dispatch = useAppDispatch();
  const { devices, setActiveMediaDevice } = useMediaDeviceSelect({
    kind,
    requestPermissions: false,
  });

  const loadLocalDevices = async () => {
    dispatch(setMediaChangeInProgress(kind));
    try {
      setLocalDevices(await Room.getLocalDevices(kind, true));
      setPermissionDenied(false);
    } catch (error) {
      setLocalDevices([]);
      log.warn(`Permission or ${kind} toggle failed: ${error}`);
      !permissionDenied &&
        notifications.warning(t('media-denied-warning', { mediaType: kind }), {
          preventDuplicate: true,
        });
      setPermissionDenied(true);
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
