// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import type { RootState } from '../index';
import { selectAvailableGridSizes, selectDefaultGridSize } from './configSlice';

const createState = (config: { maxGridTiles?: number; defaultGridSize?: number }): RootState =>
  ({ config }) as unknown as RootState;

describe('config grid size selectors', () => {
  describe('selectAvailableGridSizes', () => {
    it('returns all grid sizes when maxGridTiles is not configured', () => {
      expect(selectAvailableGridSizes(createState({}))).toEqual([6, 9, 16, 24]);
    });

    it('limits the available grid sizes to maxGridTiles', () => {
      expect(selectAvailableGridSizes(createState({ maxGridTiles: 9 }))).toEqual([6, 9]);
    });
  });

  describe('selectDefaultGridSize', () => {
    it('returns undefined when no default grid size is configured', () => {
      expect(selectDefaultGridSize(createState({}))).toBeUndefined();
    });

    it('returns undefined for a non-positive default grid size', () => {
      expect(selectDefaultGridSize(createState({ defaultGridSize: 0 }))).toBeUndefined();
    });

    it('returns the configured default grid size when maxGridTiles is not set', () => {
      expect(selectDefaultGridSize(createState({ defaultGridSize: 16 }))).toBe(16);
    });

    it('returns the configured default grid size when it is within maxGridTiles', () => {
      expect(selectDefaultGridSize(createState({ maxGridTiles: 16, defaultGridSize: 9 }))).toBe(9);
    });

    it('clamps the default grid size down to maxGridTiles when it exceeds the limit', () => {
      expect(selectDefaultGridSize(createState({ maxGridTiles: 9, defaultGridSize: 16 }))).toBe(9);
    });

    it('clamps the default grid size to the largest available grid size below maxGridTiles', () => {
      expect(selectDefaultGridSize(createState({ maxGridTiles: 10, defaultGridSize: 16 }))).toBe(9);
    });

    it('returns the default grid size when it equals maxGridTiles', () => {
      expect(selectDefaultGridSize(createState({ maxGridTiles: 16, defaultGridSize: 16 }))).toBe(16);
    });
  });
});
