// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { GRID_SIZES } from '../../constants';
import { DEFAULT_USER_MANUAL_URL } from '../../utils/apiUtils';
import type { RootState } from '../index';
import { type ConfigState, selectAvailableGridSizes, selectDefaultGridSize, selectUserManualUrl } from './configSlice';

const createState = (config: Partial<ConfigState>): RootState => ({ config }) as unknown as RootState;

describe('selectUserManualUrl', () => {
  it('returns the default URL when unset', () => {
    expect(selectUserManualUrl(createState({}))).toBe(DEFAULT_USER_MANUAL_URL);
  });

  it('returns the configured URL', () => {
    const userManualUrl = 'https://example.com/manual';

    expect(selectUserManualUrl(createState({ userManualUrl }))).toBe(userManualUrl);
  });

  it('returns the default URL for an empty string', () => {
    expect(selectUserManualUrl(createState({ userManualUrl: '' }))).toBe(DEFAULT_USER_MANUAL_URL);
  });
});

describe('config grid size selectors', () => {
  describe('selectAvailableGridSizes', () => {
    it('returns all grid sizes when maxGridTiles is not configured', () => {
      expect(selectAvailableGridSizes(createState({}))).toEqual(GRID_SIZES);
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
