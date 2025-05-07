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

//theoretically we could separate blurring and background image if we use this check
export const isBackgroundEffectSupported = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const isFilterAvailable = ctx?.filter !== undefined;
  canvas.remove();
  return isFilterAvailable;
};
