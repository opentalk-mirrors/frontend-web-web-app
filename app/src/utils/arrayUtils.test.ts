// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { moveItemToTopOfArray } from './arrayUtils';

describe('arrayUtils', () => {
  describe('move item to top of array function', () => {
    it('should move a primitive item to the top of the array given no identifier function', () => {
      const array = [1, 2, 3, 4, 5];
      const mutatedArray = moveItemToTopOfArray(3, array);
      expect(array).toStrictEqual([1, 2, 3, 4, 5]);
      expect(mutatedArray).toStrictEqual([3, 1, 2, 4, 5]);
    });
    it('should move an object to the top of the array given an identifier function', () => {
      const array = [
        { firstName: 'Alice', lastName: 'Adams' },
        { firstName: 'Bob', lastName: 'Burton' },
        { firstName: 'Carl', lastName: 'Carlsen' },
      ];
      const mutatedArray = moveItemToTopOfArray(
        { firstName: 'Carl', lastName: 'Carlsen' },
        array,
        (person) => person.firstName === 'Carl' && person.lastName === 'Carlsen'
      );
      expect(array).toStrictEqual([
        { firstName: 'Alice', lastName: 'Adams' },
        { firstName: 'Bob', lastName: 'Burton' },
        { firstName: 'Carl', lastName: 'Carlsen' },
      ]);
      expect(mutatedArray).toStrictEqual([
        { firstName: 'Carl', lastName: 'Carlsen' },
        { firstName: 'Alice', lastName: 'Adams' },
        { firstName: 'Bob', lastName: 'Burton' },
      ]);
    });
    it('should move an object to the top of the array given no identifier function', () => {
      const array = [
        { firstName: 'Alice', lastName: 'Adams' },
        { firstName: 'Bob', lastName: 'Burton' },
        { firstName: 'Carl', lastName: 'Carlsen' },
      ];
      const mutatedArray = moveItemToTopOfArray({ firstName: 'Carl', lastName: 'Carlsen' }, array);
      expect(array).toStrictEqual([
        { firstName: 'Alice', lastName: 'Adams' },
        { firstName: 'Bob', lastName: 'Burton' },
        { firstName: 'Carl', lastName: 'Carlsen' },
      ]);
      expect(mutatedArray).toStrictEqual([
        { firstName: 'Carl', lastName: 'Carlsen' },
        { firstName: 'Alice', lastName: 'Adams' },
        { firstName: 'Bob', lastName: 'Burton' },
      ]);
    });
    it('should not return a copy if the item is already on top', () => {
      const array = [1, 2, 3, 4, 5];
      const mutatedArray = moveItemToTopOfArray(1, array);
      expect(mutatedArray).toBe(array);
    });
  });
});
