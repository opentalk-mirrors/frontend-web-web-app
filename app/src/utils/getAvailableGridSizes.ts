// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { GRID_SIZES } from '../constants';

export const getAvailableGridSizes = (maxGridTiles?: number | string): readonly number[] => {
  const maxTiles = Number(maxGridTiles);
  if (maxGridTiles === undefined || maxGridTiles === '' || Number.isNaN(maxTiles)) {
    return GRID_SIZES;
  }
  const availableSizes = GRID_SIZES.filter((size) => size <= maxTiles);
  return availableSizes.length > 0 ? availableSizes : [GRID_SIZES[0]];
};
