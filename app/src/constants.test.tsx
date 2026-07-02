// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { GRID_SIZES, getAvailableGridSizes } from './constants';

describe('getAvailableGridSizes', () => {
  it('returns all grid sizes when maxGridTiles is undefined', () => {
    expect(getAvailableGridSizes(undefined)).toEqual(GRID_SIZES);
  });

  it('returns all grid sizes when maxGridTiles is an empty string', () => {
    expect(getAvailableGridSizes('')).toEqual(GRID_SIZES);
  });

  it('returns all grid sizes when maxGridTiles is not a number', () => {
    expect(getAvailableGridSizes('not-a-number')).toEqual(GRID_SIZES);
  });

  it('omits grid sizes larger than maxGridTiles', () => {
    expect(getAvailableGridSizes(9)).toEqual([6, 9]);
  });

  it('coerces a numeric string maxGridTiles', () => {
    expect(getAvailableGridSizes('16')).toEqual([6, 9, 16]);
  });

  it('falls back to the smallest grid size when maxGridTiles is below all sizes', () => {
    expect(getAvailableGridSizes(1)).toEqual([GRID_SIZES[0]]);
  });
});
