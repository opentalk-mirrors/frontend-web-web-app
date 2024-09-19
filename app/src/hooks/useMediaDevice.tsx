// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
//
import { useMaybeRoomContext, useMediaDeviceSelect } from '@livekit/components-react';
import { Room } from 'livekit-client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { notifications } from '../commonComponents';
import { useMediaChoices } from '../provider/MediaChoicesProvider';

interface MediaPermissionsConstraints {
  kind: MediaDeviceKind;
  deviceId?: ConstrainDOMString;
}

/* The `useMediaDevice` function is a custom React hook that handles checking and managing
media permissions for a specific kind of media device (audio input or video input). It
utilizes the `navigator.mediaDevices.getUserMedia` method to request access to the user's
media devices based on the specified constraints. */
const useMediaDevice = ({ kind }: MediaPermissionsConstraints) => {
  const mediaChoices = useMediaChoices();
  const { t } = useTranslation();
  const [permissionDenied, setPermissionDenied] = useState<boolean | 'pending'>(false);
  const [localDevices, setLocalDevices] = useState<MediaDeviceInfo[]>([]);
  const room = useMaybeRoomContext();

  const { devices, setActiveMediaDevice } = useMediaDeviceSelect({
    kind,
    requestPermissions: false,
  });

  const getSelectedAudioDeviceId = (stream: MediaStream) =>
    stream.getAudioTracks()?.[0].getSettings().deviceId?.toString();
  const getSelectedVideoDeviceId = (stream: MediaStream) =>
    stream.getVideoTracks()?.[0].getSettings().deviceId?.toString();

  const getVideoContraints = (deviceId?: string) => ({
    video: { deviceId: deviceId || mediaChoices?.userChoices.videoDeviceId },
  });
  const getAudioContraints = (deviceId?: string) => ({
    audio: { deviceId: deviceId || mediaChoices?.userChoices.audioDeviceId },
  });

  const getMediaConstraints = (deviceId?: string) =>
    kind === 'audioinput' ? getAudioContraints(deviceId) : getVideoContraints(deviceId);

  const isMediaStartSuccessful = async (enableMediaInput: boolean, deviceId?: string): Promise<boolean> => {
    try {
      let selectedDeviceId: string | undefined;
      if (
        enableMediaInput ||
        mediaChoices?.userChoices.audioEnabled ||
        mediaChoices?.userChoices.videoEnabled ||
        (devices.length !== localDevices.length && devices.length > 0)
      ) {
        const constraints = getMediaConstraints(deviceId);
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        selectedDeviceId = kind === 'audioinput' ? getSelectedAudioDeviceId(stream) : getSelectedVideoDeviceId(stream);

        stream.getTracks().forEach((track) => {
          track.stop();
        });
      } else {
        selectedDeviceId = deviceId;
      }

      if (selectedDeviceId) {
        if (kind === 'audioinput') {
          mediaChoices?.saveAudioInputDeviceId(selectedDeviceId);
          !mediaChoices?.userChoices.audioEnabled && mediaChoices?.saveAudioInputEnabled(enableMediaInput);
        } else {
          mediaChoices?.saveVideoInputDeviceId(selectedDeviceId);
          !mediaChoices?.userChoices.videoEnabled && mediaChoices?.saveVideoInputEnabled(enableMediaInput);
        }
        room && (await setActiveMediaDevice(selectedDeviceId));
      }
      setPermissionDenied(false);
      return true;
    } catch (error) {
      // The following errors are thrown if user and operating system both granted access to the hardware device, but some problem occurred which prevented the device from being used
      // e.g. if the stream is occupied by another application
      // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#exceptions
      if (error instanceof DOMException && (error.name === 'AbortError' || error.name === 'NotReadableError')) {
        console.debug(`Failed to start ${kind} with device: ${deviceId}`);
        return false;
      }

      setPermissionDenied(true);
      setLocalDevices([]);
      console.debug(`Permission or ${kind} toggle failed: ${error}`);
      notifications.warning(t('media-denied-warning', { mediaType: kind }), {
        preventDuplicate: true,
      });
      return false;
    }
  };

  const loadLocalDevices = async (kind: MediaDeviceKind, requestPermissions = true) => {
    try {
      setLocalDevices(await Room.getLocalDevices(kind, requestPermissions));
    } catch (error) {
      setPermissionDenied(true);
      setLocalDevices([]);
      console.debug(`Permission or ${kind} toggle failed: ${error}`);
      notifications.warning(t('media-denied-warning', { mediaType: kind }), {
        preventDuplicate: true,
      });
    }
  };

  const startMedia = async (enableMediaInput: boolean, deviceId?: string) => {
    setPermissionDenied('pending');

    const userMediaChoiceId =
      kind === 'audioinput' ? mediaChoices?.userChoices.audioDeviceId : mediaChoices?.userChoices.videoDeviceId;
    const success = await isMediaStartSuccessful(enableMediaInput, deviceId ?? userMediaChoiceId);
    if (success) return;

    loadLocalDevices(kind);
    setPermissionDenied(false);
    notifications.warning(t('device-unable-to-start', { mediaType: kind }), {
      preventDuplicate: true,
    });
  };

  return {
    permissionDenied,
    startMedia,
    devices,
    localDevices,
    loadLocalDevices,
  };
};

export default useMediaDevice;
