// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import roundToUpper30 from './roundToUpper30';

describe('roundToUpper30()', () => {
  it('should return Date instance', () => {
    const input = new Date('12/13/2022 13:32:48 UTC');
    expect(roundToUpper30(input)).toBeInstanceOf(Date);
  });

  it.each([
    ['12/13/2022 13:32:48 UTC', '2022-12-13T14:00:00.000Z'],
    ['12/13/2022 16:42 UTC', '2022-12-13T17:00:00.000Z'],
    ['12/13/2022 16:47 UTC', '2022-12-13T17:00:00.000Z'],
    ['12/13/2022 17:30 UTC', '2022-12-13T18:00:00.000Z'],
    ['12/20/2022 23:45 UTC', '2022-12-21T00:00:00.000Z'],
  ])('"%s" produces "%s"', (input, output) => {
    expect(roundToUpper30(new Date(input)).toISOString()).toBe(output);
  });
});
