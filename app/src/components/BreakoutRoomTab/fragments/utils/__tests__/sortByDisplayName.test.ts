// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { sortByDisplayName } from '../sortByDisplayName';

describe('sortByDisplayName', () => {
  it('should sort an array of objects by displayName in ascending order', () => {
    const input = [
      { id: 1, displayName: 'Charlie' },
      { id: 2, displayName: 'Alice' },
      { id: 3, displayName: 'Bob' },
    ];

    const expectedOutput = [
      { id: 2, displayName: 'Alice' },
      { id: 3, displayName: 'Bob' },
      { id: 1, displayName: 'Charlie' },
    ];

    expect(sortByDisplayName(input)).toEqual(expectedOutput);
  });

  it('should handle empty displayName values', () => {
    const input = [
      { id: 1, displayName: '' },
      { id: 2, displayName: 'Alice' },
      { id: 3, displayName: undefined },
    ];

    const expectedOutput = [
      { id: 1, displayName: '' },
      { id: 3, displayName: undefined },
      { id: 2, displayName: 'Alice' },
    ];

    expect(sortByDisplayName(input)).toEqual(expectedOutput);
  });
});
