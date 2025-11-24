// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
//
import { useMediaDeviceSelect } from '@livekit/components-react';
import { Room } from 'livekit-client';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { notifications } from '../commonComponents';
import log from '../logger';

interface MediaPermissionsConstraints {
  kind: MediaDeviceKind;
  deviceId?: ConstrainDOMString;
}

const useMediaDevice = ({ kind }: MediaPermissionsConstraints) => {
  const { t } = useTranslation();
  const [permissionDenied, setPermissionDenied] = useState<boolean | 'pending'>(false);
  const [localDevices, setLocalDevices] = useState<MediaDeviceInfo[]>([]);
  const { devices, setActiveMediaDevice } = useMediaDeviceSelect({
    kind,
    requestPermissions: false,
  });

  const loadLocalDevices = useCallback(async () => {
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
    }
  }, [kind, t, permissionDenied]);

  return {
    permissionDenied,
    devices,
    localDevices,
    loadLocalDevices,
    setActiveMediaDevice,
  };
};

export default useMediaDevice;
