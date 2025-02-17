// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { t } from 'i18next';

import { notifications } from '../commonComponents';
import { MediaDeviceKindExtended, MediaError } from '../store/slices/mediaSlice';

export interface MediaPermissionErrorHandler {
  error: unknown;
  kind: MediaDeviceKindExtended;
  deviceId?: string;
}

export const handleMediaPermissionError = ({ error, kind, deviceId }: MediaPermissionErrorHandler) => {
  if (error instanceof DOMException) {
    switch (error.name) {
      case MediaError.AbortError:
        console.debug(`AbortError: Failed to start ${kind} with device: ${deviceId}`);
        return error;
      case MediaError.NotAllowedError:
        notifications.warning(t('media-denied-warning', { mediaType: kind }), {
          preventDuplicate: true,
        });
        return error;
      default:
        console.debug(`Failed to start ${kind} with device: ${deviceId}`);
        notifications.warning(t('device-unable-to-start', { mediaType: kind }), {
          preventDuplicate: true,
        });
        return error;
    }
  }
  throw new Error(`Error toggling ${kind}: ${error}`);
};
