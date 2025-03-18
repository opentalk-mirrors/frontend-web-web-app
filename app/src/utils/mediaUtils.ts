// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2

export const getDeviceId = (track: MediaStreamTrack): string | undefined => {
  if (typeof track?.getCapabilities === 'function') {
    return track?.getCapabilities().deviceId;
  }

  // Fallback for older browsers (e.g. Firefox ESR 128)
  return track?.getSettings().deviceId;
};
