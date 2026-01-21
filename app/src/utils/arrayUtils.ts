// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { shuffle } from 'lodash';

export const spliceIntoChunks = <T>(array: T[], splitSize: number): T[][] => {
  if (splitSize >= array.length) {
    return array.map((item) => [item]);
  }

  const base = Math.floor(array.length / splitSize);
  const remainder = array.length % splitSize;

  let index = 0;
  return Array.from({ length: splitSize }, (_, i) => {
    const size = base + (i < remainder ? 1 : 0);
    const chunk = array.slice(index, index + size);
    index += size;
    return chunk;
  });
};

/**
 * Creates an array of shuffled values, using a version of the Fisher-Yates shuffle.
 * Facade of Lodash `shuffle` method.
 *
 * The fisher-yates algorithm that lodash is using is the fast running
 * variation based on the random values. This algorithm has time complexity of O(nlogn)
 * but is not guaranteed to return
 */
export function shuffleArrayItems<T>(array: Array<T>): Array<T> {
  const shuffled = shuffle(array);
  if (shuffled.every((value, index) => value === array[index])) {
    return shuffleArrayItems(array);
  }
  return shuffled;
}
/**
 * Moves the given item to the top of the array, if the item is a primitive, no identifier is needed
 * @param item the array item to be moved to the top of the array
 * @param array the array to rearrage
 * @param predicate a function to identify the correct item within the array
 * @returns a new instance of the given array with the given item at position 0 (does not mutate the original)
 */
export function moveItemToTopOfArray<T>(
  item: T,
  array: Array<T>,
  predicate?: (value: T, index?: number, obj?: T[]) => boolean
): Array<T> {
  const defaultPredicate = (arrayItem: T) => arrayItem === item;
  const selectedPredicate = predicate || defaultPredicate;
  const itemIndex = array.findIndex(selectedPredicate);
  if (itemIndex === 0) {
    return array;
  }
  const copy = [...array];
  copy.unshift(copy.splice(itemIndex, 1)[0]);
  return copy;
}
