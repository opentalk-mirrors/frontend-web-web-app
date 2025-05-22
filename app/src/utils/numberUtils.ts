// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2

export const getRandomNumber = (max = 1) => {
  return Math.round(Math.random() * max);
};

export const formatBitRate = (bitRate?: number): string => {
  if (bitRate === undefined) {
    return '-';
  }

  if (bitRate > 1000000) {
    const mRate = bitRate / 1000000;
    return `${mRate.toPrecision(3)} Mbit/s`;
  } else {
    const kRate = bitRate / 1000;
    return `${kRate.toPrecision(3)} kbit/s`;
  }
};

/*
  Format filsize units:
  Can be standard units (KB, MB...) or binary units (KiB, MiB)

  Note: Currently we limit units to MB (e.g will format 2048000000 as 2048.00 MB not 2.04 GB)
*/
export function formatBytes(bytes: number, options: { useBinaryUnits?: boolean; decimals?: number } = {}): string {
  const { useBinaryUnits = false, decimals = 2 } = options;

  if (decimals < 0) {
    throw new Error(`Invalid decimals ${decimals}`);
  }

  // edge cases
  if (bytes === 0) {
    return '0 Bytes';
  } else if (bytes === 1) {
    return '1 Byte';
  }

  const base = useBinaryUnits ? 1024 : 1000;
  const units = useBinaryUnits
    ? ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
    : ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  // limit to MB
  const MAX_UNIT_INDEX = 2;

  let unitIndex = Math.floor(Math.log(bytes) / Math.log(base));
  unitIndex = Math.min(unitIndex, MAX_UNIT_INDEX);

  const finalDecimals = unitIndex > 0 ? decimals : 0;

  return `${(bytes / Math.pow(base, unitIndex)).toFixed(finalDecimals)} ${units[unitIndex]}`;
}
