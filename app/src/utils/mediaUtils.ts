// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2

//theoretically we could separate blurring and background image if we use this check
export const isBackgroundEffectSupported = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const isFilterAvailable = ctx?.filter !== undefined;
  canvas.remove();
  return isFilterAvailable;
};
