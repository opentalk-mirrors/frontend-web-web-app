// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { spliceIntoChunks } from './arrayUtils';

describe('spliceIntoChunks', () => {
  describe('when splitSize is greater than or equal to array length', () => {
    it('should return each item in its own chunk', () => {
      const array = [1, 2, 3];
      const result = spliceIntoChunks(array, 5);

      expect(result).toEqual([[1], [2], [3]]);
    });
  });

  describe('when array divides evenly', () => {
    it('should split 6 items into 3 equal chunks of 2', () => {
      const array = [1, 2, 3, 4, 5, 6];
      const result = spliceIntoChunks(array, 3);

      expect(result).toEqual([
        [1, 2],
        [3, 4],
        [5, 6],
      ]);
    });

    it('should split 9 items into 3 equal chunks of 3', () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      const result = spliceIntoChunks(array, 3);

      expect(result).toEqual([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ]);
    });
  });

  describe('when array does not divide evenly', () => {
    it('should distribute remainder items to first chunks (7 items, 3 chunks)', () => {
      const array = [1, 2, 3, 4, 5, 6, 7];
      const result = spliceIntoChunks(array, 3);

      expect(result).toEqual([
        [1, 2, 3],
        [4, 5],
        [6, 7],
      ]);
      expect(result[0]).toHaveLength(3);
      expect(result[1]).toHaveLength(2);
      expect(result[2]).toHaveLength(2);
    });

    it('should distribute remainder items to first chunks (10 items, 3 chunks)', () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = spliceIntoChunks(array, 3);

      expect(result).toEqual([
        [1, 2, 3, 4],
        [5, 6, 7],
        [8, 9, 10],
      ]);
      expect(result[0]).toHaveLength(4);
      expect(result[1]).toHaveLength(3);
      expect(result[2]).toHaveLength(3);
    });

    it('should distribute remainder items to first chunks (11 items, 4 chunks)', () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
      const result = spliceIntoChunks(array, 4);

      expect(result).toEqual([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        [10, 11],
      ]);
      expect(result[0]).toHaveLength(3);
      expect(result[1]).toHaveLength(3);
      expect(result[2]).toHaveLength(3);
      expect(result[3]).toHaveLength(2);
    });
  });

  describe('edge cases', () => {
    it('should handle empty array', () => {
      const array: number[] = [];
      const result = spliceIntoChunks(array, 2);

      expect(result).toEqual([]);
    });

    it('should handle single item array', () => {
      const array = [1];
      const result = spliceIntoChunks(array, 3);

      expect(result).toEqual([[1]]);
    });

    it('should work with object arrays', () => {
      const array = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
      const result = spliceIntoChunks(array, 2);

      expect(result).toEqual([
        [{ id: 1 }, { id: 2 }],
        [{ id: 3 }, { id: 4 }],
      ]);
    });
  });
});
